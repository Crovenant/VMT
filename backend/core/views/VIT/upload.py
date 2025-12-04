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
from core.views.VIT.normalize import normalize_headers
from core.views.VIT.duplicates import detect_duplicates
from core.views.VIT.risk_logic import assign_ids_and_merge, calculate_due_date
from datetime import datetime

CORE_DIR = Path(apps.get_app_config("core").path)
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

JSON_PATH = DATA_DIR / "CSIRT" / "vit_Data.json"
VUL_JSON_PATH = DATA_DIR / "CSIRT" / "vul_Data.json"

_REQUIRED_CANON_MIN = {"numero", "prioridad", "estado"}


def _ensure_front_fields(e: dict) -> dict:
    if "closedDate" not in e or e.get("closedDate") is None:
        e["closedDate"] = ""
    if "closedDelayDays" not in e or e.get("closedDelayDays") is None:
        e["closedDelayDays"] = ""
    if "overdue" not in e:
        e["overdue"] = False
    if not e.get("dueDate"):
        e["dueDate"] = calculate_due_date(
            e.get("creado"), e.get("prioridad")
        ) or datetime.now().strftime("%Y-%m-%d")
    return e


@csrf_exempt
def upload_data(request):
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))
    if request.method != "POST":
        return add_cors_headers(
            JsonResponse({"error": "Method not allowed"}, status=405)
        )
    try:
        if "file" not in request.FILES:
            raise ValueError("No file was uploaded.")
        excel_file = request.FILES["file"]
        df = pd.read_excel(excel_file, engine="openpyxl")
        df = normalize_headers(df)

        got = set(map(str, df.columns))
        missing = sorted(list(_REQUIRED_CANON_MIN - got))
        if missing:
            return add_cors_headers(
                JsonResponse(
                    {
                        "error": "Normalized columns missing",
                        "missing": missing,
                        "got": sorted(list(got)),
                    },
                    status=400,
                )
            )

        new_entries = df.to_dict(orient="records")
        new_entries = [_ensure_front_fields(dict(e)) for e in new_entries]

        if JSON_PATH.exists():
            with JSON_PATH.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []
        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        duplicates, unique_new_entries = detect_duplicates(existing_data, new_entries)

        if VUL_JSON_PATH.exists():
            with VUL_JSON_PATH.open("r", encoding="utf-8") as f:
                vul_data = json.load(f)
        else:
            vul_data = []
        if not isinstance(vul_data, list):
            vul_data = [vul_data]

        relations = []
        vul_map = {str(v.get("numero", "")).strip(): v for v in vul_data}
        for vit in unique_new_entries:
            vul_num = str(vit.get("vul", "")).strip()
            vit_num = str(vit.get("numero", "")).strip()
            if vul_num and vul_num in vul_map and vit_num:
                vul_obj = vul_map[vul_num]
                before_vits = str(vul_obj.get("vits", "")).strip()
                after_vits = (
                    (before_vits + "," + vit_num).strip(",") if before_vits else vit_num
                )
                before_list = [s.strip() for s in before_vits.split(",") if s.strip()]
                if vit_num not in before_list:
                    relations.append(
                        {
                            "vulNumero": vul_num,
                            "vitNumero": vit_num,
                            "before": before_vits,
                            "after": after_vits,
                        }
                    )

        if not duplicates and not relations:
            updated_data = assign_ids_and_merge(existing_data, unique_new_entries)
            JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
            with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
                json.dump(updated_data, tmp, ensure_ascii=False, indent=2)
                tmp_name = tmp.name
            os.replace(tmp_name, JSON_PATH)
            response = JsonResponse(
                {
                    "message": "Data added successfully",
                    "new": [],
                    "duplicates": [],
                    "relations": [],
                }
            )
        else:
            response = JsonResponse(
                {
                    "message": "Pending resolution",
                    "new": unique_new_entries,
                    "duplicates": duplicates,
                    "relations": relations,
                }
            )
    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=400)
    return add_cors_headers(response)
