# backend/core/views/VIT/upload.py
import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile

import pandas as pd
from django.apps import apps
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from core.views.common.utils import add_cors_headers

# 👇 Ajusta al nuevo árbol VIT (si tu carpeta es en minúsculas usa core.views.vit...)
from core.views.VIT.normalize import normalize_headers
from core.views.VIT.duplicates import detect_duplicates
from core.views.VIT.risk_logic import assign_ids_and_merge, calculate_due_date


# ==========================
# Rutas y archivo de datos
# ==========================
# /backend/core
CORE_DIR = Path(apps.get_app_config("core").path)

# /backend/core/data
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# 🔴 Fichero único de VIT
JSON_PATH = DATA_DIR / "vit_Data.json"


@csrf_exempt
def upload_data(request):
    # Preflight CORS
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "POST":
        return add_cors_headers(JsonResponse({"error": "Method not allowed"}, status=405))

    try:
        if "file" not in request.FILES:
            raise ValueError("No file was uploaded.")

        excel_file = request.FILES["file"]

        # Lee Excel
        df = pd.read_excel(excel_file, engine="openpyxl")

        # Normaliza cabeceras/campos según la lógica de VIT
        df = normalize_headers(df)

        new_entries = df.to_dict(orient="records")

        # Asegura dueDate para cada nueva entrada
        for entry in new_entries:
            if isinstance(entry, dict) and not entry.get("dueDate"):
                entry["dueDate"] = calculate_due_date(entry.get("creado"), entry.get("prioridad"))

        # Carga datos existentes
        if JSON_PATH.exists():
            with JSON_PATH.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        # Detecta duplicados
        duplicates, unique_new_entries = detect_duplicates(existing_data, new_entries)

        if not duplicates:
            # Merge directo con asignación de IDs y escritura atómica
            updated_data = assign_ids_and_merge(existing_data, unique_new_entries)
            with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
                json.dump(updated_data, tmp, ensure_ascii=False, indent=2)
                tmp_name = tmp.name
            os.replace(tmp_name, JSON_PATH)

            response = JsonResponse(
                {"message": "Data added successfully", "new": [], "duplicates": []}
            )
        else:
            # Devuelve nuevos únicos + duplicados para resolución posterior
            response = JsonResponse(
                {
                    "message": "Duplicates detected",
                    "new": unique_new_entries,
                    "duplicates": duplicates,
                }
            )

    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(response)
