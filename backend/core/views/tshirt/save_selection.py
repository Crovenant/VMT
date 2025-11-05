# backend/core/views/tshirt/save_selection.py
import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps

from core.views.common.utils import add_cors_headers
from core.views.tshirt.duplicates import build_lookup
from core.views.tshirt.risk_logic import update_selected_entries, calculate_due_date

# Localización del JSON dentro del app 'core': backend/core/data/tshirt_Data.json
CORE_DIR = Path(apps.get_app_config("core").path)      # .../backend/core
DATA_DIR = CORE_DIR / "data"                           # .../backend/core/data
DATA_DIR.mkdir(exist_ok=True)
JSON_PATH = DATA_DIR / "tshirt_Data.json"              # antiguo risk_Data.json

@csrf_exempt
def save_selection(request):
    # Preflight CORS
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "POST":
        return add_cors_headers(JsonResponse({"error": "Method not allowed"}, status=405))

    try:
        print("📥 Recibiendo datos en save_selection...")

        body = json.loads(request.body.decode("utf-8"))
        print("🔍 Cuerpo recibido:", body)

        selected_entries = body.get("entries", [])
        print("📋 Entradas seleccionadas:", selected_entries)

        if not isinstance(selected_entries, list):
            raise ValueError("Invalid data format: 'entries' must be a list.")

        # Asegurar dueDate en la selección entrante
        for e in selected_entries:
            if isinstance(e, dict) and not e.get("dueDate"):
                e["dueDate"] = calculate_due_date(e.get("creado"), e.get("prioridad"))

        # Carga datos existentes
        if JSON_PATH.exists():
            with JSON_PATH.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        # Diccionario de búsqueda para resolución de duplicados
        lookup = build_lookup(existing_data)

        # Fusión/actualización según selección
        final_data = update_selected_entries(existing_data, selected_entries, lookup)

        print("🧾 Datos finales que se van a guardar:",
              json.dumps(final_data, indent=2, ensure_ascii=False))

        # Escritura atómica
        with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
            json.dump(final_data, tmp, ensure_ascii=False, indent=2)
            tmp_name = tmp.name
        os.replace(tmp_name, JSON_PATH)

        print("✅ Datos guardados correctamente en", JSON_PATH.name)

        response = JsonResponse({"message": "Selection saved successfully"})
    except Exception as e:
        print("❌ Error en save_selection:", str(e))
        response = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(response)
