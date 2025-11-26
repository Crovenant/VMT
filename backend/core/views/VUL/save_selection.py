# core/views/VUL/save_selection.py
import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import List, Dict
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps
from core.views.common.utils import add_cors_headers
from core.views.VUL.risk_logic import update_selected_entries_vul, ensure_due_vul

CORE_DIR = Path(apps.get_app_config("core").path)
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

JSON_PATH = DATA_DIR / "CSIRT" / "vul_Data.json"


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
            if isinstance(e, dict):
                e = ensure_due_vul(e)

        if JSON_PATH.exists():
            with JSON_PATH.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        final_data = update_selected_entries_vul(existing_data, selected_entries)

        with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
            json.dump(final_data, tmp, ensure_ascii=False, indent=2)
            tmp_name = tmp.name
        os.replace(tmp_name, JSON_PATH)

        response = JsonResponse({"message": "Selection saved successfully"})

    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(response)
