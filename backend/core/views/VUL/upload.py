# backend/core/views/VUL/upload.py
import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import List, Dict, Tuple, Any

import pandas as pd
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
# Duplicados (clave compuesta)
# ==========================
def _norm(val: Any) -> str:
    return ("" if val is None else str(val)).strip().lower()

def _key(item: Dict) -> Tuple[str, str]:
    """
    Clave compuesta para VUL (elige las más estables del dataset):
    - Vulnerability ID
    - VUL Code
    """
    return (_norm(item.get("Vulnerability ID", "")), _norm(item.get("VUL Code", "")))

def _build_lookup(rows: List[Dict]) -> Dict[Tuple[str, str], Dict]:
    idx: Dict[Tuple[str, str], Dict] = {}
    for r in rows:
        idx[_key(r)] = r
    return idx

def detect_duplicates(existing_data: List[Dict], new_entries: List[Dict]):
    """
    Devuelve (duplicates, unique_new_entries)

    - duplicates: lista de dicts {"existing": <fila_json>, "incoming": <fila_excel>}
      cuando hay coincidencia exacta por (Vulnerability ID, VUL Code) normalizados.

    - unique_new_entries: filas del Excel que NO tienen match por la clave compuesta.
    """
    lookup = _build_lookup(existing_data)
    duplicates = []
    unique_new_entries = []

    for entry in new_entries:
        k = _key(entry)
        if k in lookup:
            duplicates.append({"existing": lookup[k], "incoming": entry})
        else:
            unique_new_entries.append(entry)

    return duplicates, unique_new_entries


# ==========================
# Upload handler
# ==========================
@csrf_exempt
def soup_upload_data(request):
    """
    LEGACY nombre de función (para compat con rutas antiguas si las apuntas aquí),
    pero corresponde a la subida de VUL (antes SOUP).
    """
    # Preflight CORS
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "POST":
        return add_cors_headers(JsonResponse({"error": "Method not allowed"}, status=405))

    try:
        if "file" not in request.FILES:
            raise ValueError("No file was uploaded.")

        file = request.FILES["file"]

        # Soportar Excel y CSV de forma simple
        name = getattr(file, "name", "").lower()
        if name.endswith(".csv"):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file, engine="openpyxl")

        # En VUL no renombramos cabeceras: trabajamos con las originales del dataset
        new_entries = df.to_dict(orient="records")

        # Cargar datos existentes con fallback (si solo existiera soup_Data.json, load_json_data ya lo usa)
        existing_data = load_json_data("vul_Data.json")
        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        # Detectar duplicados por (Vulnerability ID, VUL Code)
        duplicates, unique_new_entries = detect_duplicates(existing_data, new_entries)

        if not duplicates:
            # Merge directo y escritura atómica en vul_Data.json
            updated = existing_data + unique_new_entries

            with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
                json.dump(updated, tmp, ensure_ascii=False, indent=2)
                tmp_name = tmp.name
            os.replace(tmp_name, JSON_PATH)

            resp = JsonResponse({
                "message": "Data added successfully",
                "new": [],
                "duplicates": []
            })
        else:
            # Devuelve los duplicados y los nuevos únicos para resolución posterior
            resp = JsonResponse({
                "message": "Duplicates detected",
                "new": unique_new_entries,
                "duplicates": duplicates
            })

    except Exception as e:
        resp = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(resp)
