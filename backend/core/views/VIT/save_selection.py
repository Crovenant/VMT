# core/views/VIT/save_selection.py
import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps
from core.views.common.utils import add_cors_headers
from core.views.VIT.duplicates import build_lookup
from core.views.VIT.risk_logic import update_selected_entries, calculate_due_date

CORE_DIR = Path(apps.get_app_config("core").path)
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

JSON_PATH = DATA_DIR / "CSIRT" / "vit_Data.json"


@csrf_exempt
def save_selection(request):
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "POST":
        return add_cors_headers(
            JsonResponse({"error": "Method not allowed"}, status=405)
        )

    try:
        body = json.loads(request.body.decode("utf-8"))
        selected_entries = body.get("entries", [])

        if not isinstance(selected_entries, list):
            raise ValueError("Invalid data format: 'entries' must be a list.")

        for e in selected_entries:
            if isinstance(e, dict) and not e.get("dueDate"):
                e["dueDate"] = calculate_due_date(e.get("creado"), e.get("prioridad"))

        if JSON_PATH.exists():
            with JSON_PATH.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        lookup = build_lookup(existing_data)
        final_data = update_selected_entries(existing_data, selected_entries, lookup)

        with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
            json.dump(final_data, tmp, ensure_ascii=False, indent=2)
            tmp_name = tmp.name
        os.replace(tmp_name, JSON_PATH)

        response = JsonResponse({"message": "Selection saved successfully"})

    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(response)
