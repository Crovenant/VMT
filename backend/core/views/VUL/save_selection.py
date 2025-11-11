# backend/core/views/VUL/save_selection.py
import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Dict, List, Tuple, Any

from django.apps import apps
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from core.views.common.utils import add_cors_headers, load_json_data


# ==========================
# Rutas y archivo de datos
# ==========================
# /backend/core
CORE_DIR = Path(apps.get_app_config("core").path)

# /backend/core/data
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Fichero único de VUL
JSON_PATH = DATA_DIR / "vul_Data.json"


# ==========================
# Helpers de clave compuesta
# ==========================
def _norm(val: Any) -> str:
    return ("" if val is None else str(val)).strip().lower()

def _key(item: Dict) -> Tuple[str, str]:
    """
    Clave compuesta estable para VUL:
    - Vulnerability ID
    - VUL Code
    """
    return (_norm(item.get("Vulnerability ID", "")), _norm(item.get("VUL Code", "")))


@csrf_exempt
def soup_save_selection(request):
    """
    LEGACY nombre (para compat si tu urls.py lo referencia así).
    Guarda/actualiza entradas del dataset VUL en vul_Data.json.
    Merge por (Vulnerability ID, VUL Code).
    """
    # Preflight CORS
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "POST":
        return add_cors_headers(JsonResponse({"error": "Method not allowed"}, status=405))

    try:
        body = json.loads(request.body.decode("utf-8"))
        selected_entries = body.get("entries", [])
        if not isinstance(selected_entries, list):
            raise ValueError("Invalid data format: 'entries' must be a list.")

        # Cargar datos existentes (con fallback si sólo existe soup_Data.json)
        existing_data = load_json_data("vul_Data.json")
        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        # Índice por clave compuesta → posición en la lista
        index_by_key: Dict[Tuple[str, str], int] = {}
        for i, row in enumerate(existing_data):
            index_by_key[_key(row)] = i

        # Aplicar merges
        for entry in selected_entries:
            k = _key(entry)
            if k in index_by_key:
                # Update (sustituimos por la versión entrante)
                existing_data[index_by_key[k]] = entry
            else:
                # Insert
                index_by_key[k] = len(existing_data)
                existing_data.append(entry)

        # Escritura atómica
        with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
            json.dump(existing_data, tmp, ensure_ascii=False, indent=2)
            tmp_name = tmp.name
        os.replace(tmp_name, JSON_PATH)

        resp = JsonResponse({"message": "Selection saved successfully"})
    except Exception as e:
        resp = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(resp)
