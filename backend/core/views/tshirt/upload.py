# backend/core/views/tshirt/upload.py
import json
import pandas as pd
from pathlib import Path
from tempfile import NamedTemporaryFile
import os

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps

from core.views.common.utils import add_cors_headers
from core.views.tshirt.normalize import normalize_headers
from core.views.tshirt.duplicates import detect_duplicates
from core.views.tshirt.risk_logic import assign_ids_and_merge, calculate_due_date

# Localización del JSON dentro del app 'core': backend/core/data/tshirt_Data.json
CORE_DIR = Path(apps.get_app_config("core").path)      # .../backend/core
DATA_DIR = CORE_DIR / "data"                           # .../backend/core/data
DATA_DIR.mkdir(exist_ok=True)
JSON_PATH = DATA_DIR / "tshirt_Data.json"              # antiguo risk_Data.json

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
        # Normaliza cabeceras/campos según tu lógica actual
        df = normalize_headers(df)

        new_entries = df.to_dict(orient="records")

        # ✅ Calcula Due Date para cada nueva entrada (clave de fecha: 'creado')
        for entry in new_entries:
            if isinstance(entry, dict) and not entry.get("dueDate"):
                entry["dueDate"] = calculate_due_date(entry.get("creado"), entry.get("prioridad"))

        # Carga datos existentes (si no existe, lista vacía)
        if JSON_PATH.exists():
            with JSON_PATH.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        # Detecta duplicados por clave compuesta
        duplicates, unique_new_entries = detect_duplicates(existing_data, new_entries)

        if not duplicates:
            # Todo nuevo → merge con asignación de IDs únicos incrementales
            updated_data = assign_ids_and_merge(existing_data, unique_new_entries)

            # Escritura atómica
            with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
                json.dump(updated_data, tmp, ensure_ascii=False, indent=2)
                tmp_name = tmp.name
            os.replace(tmp_name, JSON_PATH)

            response = JsonResponse({
                "message": "Data added successfully",
                "new": [],
                "duplicates": []
            })
        else:
            # Hay duplicados → se resuelven en el paso posterior
            response = JsonResponse({
                "message": "Duplicates detected",
                "new": unique_new_entries,
                "duplicates": duplicates
            })

    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(response)
