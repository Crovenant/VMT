import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import List, Dict, Tuple, Any
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps

from core.views.common.utils import add_cors_headers

# ==========================
# Rutas y archivo de datos
# ==========================
CORE_DIR = Path(apps.get_app_config("core").path)
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# ✅ Ajuste: vul_Data.json ahora está en subcarpeta CSIRT
JSON_PATH = DATA_DIR / "CSIRT" / "vul_Data.json"

# ==========================
# Clave compuesta para VUL
# ==========================
def _norm(val: Any) -> str:
    return ("" if val is None else str(val)).strip().lower()

def _key(item: Dict) -> Tuple[str, str]:
    return (_norm(item.get("Vulnerability ID", "")), _norm(item.get("VUL Code", "")))

@csrf_exempt
def save_selection(request):
    """
    Handler para guardar selección en VUL.
    """
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "POST":
        return add_cors_headers(JsonResponse({"error": "Method not allowed"}, status=405))

    try:
        body = json.loads(request.body.decode("utf-8"))
        selected_entries = body.get("entries", [])

        if not isinstance(selected_entries, list):
            raise ValueError("Invalid data format: 'entries' must be a list.")

        # Cargar datos existentes
        if JSON_PATH.exists():
            with JSON_PATH.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        # Merge: eliminar duplicados por clave compuesta y añadir nuevas
        existing_lookup = {_key(row): row for row in existing_data}
        for entry in selected_entries:
            existing_lookup[_key(entry)] = entry

        final_data = list(existing_lookup.values())

        # Escritura atómica
        with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
            json.dump(final_data, tmp, ensure_ascii=False, indent=2)
            tmp_name = tmp.name
        os.replace(tmp_name, JSON_PATH)

        resp = JsonResponse({"message": "Selection saved successfully"})

    except Exception as e:
        resp = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(resp)