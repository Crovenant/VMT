# backend/core/views/VUL/upload.py
import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile

import pandas as pd
from django.apps import apps
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from core.views.common.utils import add_cors_headers
from core.views.VUL.normalize import normalize_headers_vul
from core.views.VUL.duplicates import detect_duplicates
from core.views.VUL.risk_logic import assign_ids_and_merge_vul, ensure_due_vul

CORE_DIR = Path(apps.get_app_config("core").path)
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

VUL_JSON_PATH = DATA_DIR / "CSIRT" / "vul_Data.json"
VIT_JSON_PATH = DATA_DIR / "CSIRT" / "vit_Data.json"

_REQUIRED_CANON = {
    "numero",
    "activo",
    "elementosVulnerables",
    "asignadoA",
    "grupoAsignacion",
    "prioridad",
    "estado",
    "actualizado",
    "vits",
}

def _ok(payload: dict, status: int = 200):
    return add_cors_headers(JsonResponse(payload, status=status, safe=False))

def _bad(msg: str, **extra):
    p = {"error": msg}
    p.update(extra)
    return add_cors_headers(JsonResponse(p, status=400))

@csrf_exempt
def upload_data(request):
    if request.method == "OPTIONS":
        return _ok({"message": "Preflight OK"})
    if request.method != "POST":
        return _bad("Method not allowed")

    try:
        if "file" not in request.FILES:
            return _bad('No file was uploaded. Expected FormData field "file".')

        excel_file = request.FILES["file"]

        try:
            df = pd.read_excel(excel_file, engine="openpyxl")
        except ImportError:
            return _bad("openpyxl is required on server to read .xlsx files.")
        except Exception as e:
            return _bad("Failed to read Excel file", details=str(e))

        if df is None or df.empty:
            return _bad("Excel is empty or unreadable.")

        try:
            df = normalize_headers_vul(df)
        except Exception as e:
            return _bad("Header normalization failed", details=str(e))

        got = set(map(str, df.columns))
        missing = sorted(list(_REQUIRED_CANON - got))
        if missing:
            return _bad(
                "Normalized columns missing",
                missing=missing,
                got=sorted(list(got)),
            )

        new_entries = df.to_dict(orient="records")
        for i, entry in enumerate(new_entries):
            if isinstance(entry, dict):
                new_entries[i] = ensure_due_vul(entry)

        if VUL_JSON_PATH.exists():
            with VUL_JSON_PATH.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []
        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        res = detect_duplicates(existing_data, new_entries)
        if not isinstance(res, tuple) or len(res) != 2:
            duplicates, unique_new_entries = [], new_entries
        else:
            duplicates, unique_new_entries = res

        if VIT_JSON_PATH.exists():
            with VIT_JSON_PATH.open("r", encoding="utf-8") as f:
                vit_data = json.load(f)
        else:
            vit_data = []
        if not isinstance(vit_data, list):
            vit_data = [vit_data]

        relations = []
        for vul in unique_new_entries:
            vul_num = str(vul.get("numero", "")).strip()
            if not vul_num:
                continue

            before_vits = str(vul.get("vits", "")).strip()
            before_set = {s.strip() for s in before_vits.split(",") if s.strip()}

            for vit in vit_data:
                vit_num = str(vit.get("numero", "")).strip()
                if not vit_num:
                    continue
                vit_vul_field = str(vit.get("vul", vit.get("VUL", ""))).strip()
                if not vit_vul_field:
                    continue
                if vit_vul_field == vul_num and vit_num not in before_set:
                    after_vits = (before_vits + "," + vit_num).strip(",") if before_vits else vit_num
                    relations.append(
                        {
                            "vulNumero": vul_num,
                            "vitNumero": vit_num,
                            "before": before_vits,
                            "after": after_vits,
                        }
                    )

        if not duplicates:
            if relations:
                return _ok(
                    {
                        "message": "Relations detected",
                        "new": unique_new_entries,
                        "duplicates": [],
                        "relations": relations,
                    }
                )

            updated_data = assign_ids_and_merge_vul(existing_data, unique_new_entries)
            VUL_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
            with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
                json.dump(updated_data, tmp, ensure_ascii=False, indent=2)
                tmp_name = tmp.name
            os.replace(tmp_name, VUL_JSON_PATH)

            return _ok(
                {
                    "message": "Data added successfully",
                    "new": [],
                    "duplicates": [],
                    "relations": [],
                }
            )

        return _ok(
            {
                "message": "Duplicates detected",
                "new": unique_new_entries,
                "duplicates": duplicates,
                "relations": relations,
            }
        )

    except Exception as e:
        return _bad(str(e))
