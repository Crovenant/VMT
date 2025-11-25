# core/views/VUL/upload.py
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
DATA_DIR.mkdir(exist_ok=True)

VUL_JSON_PATH = DATA_DIR / "CSIRT" / "vul_Data.json"
VIT_JSON_PATH = DATA_DIR / "CSIRT" / "vit_Data.json"  # Para leer VIT existentes


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
        df = normalize_headers_vul(df)
        new_entries = df.to_dict(orient="records")

        # Asegurar dueDate en nuevas entradas
        for entry in new_entries:
            if isinstance(entry, dict):
                entry = ensure_due_vul(entry)

        # Leer datos existentes de VUL
        if VUL_JSON_PATH.exists():
            with VUL_JSON_PATH.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        # Detectar duplicados en VUL
        duplicates, unique_new_entries = detect_duplicates(existing_data, new_entries)

        # Leer datos existentes de VIT para detectar relaciones inversas
        if VIT_JSON_PATH.exists():
            with VIT_JSON_PATH.open("r", encoding="utf-8") as f:
                vit_data = json.load(f)
        else:
            vit_data = []

        if not isinstance(vit_data, list):
            vit_data = [vit_data]

        vit_map = {str(v.get("numero", "")).strip(): v for v in vit_data}

        # Detectar relaciones inversas: VUL -> VIT
        relations = []
        for vul in unique_new_entries:
            vul_num = str(vul.get("Número", "")).strip()
            if not vul_num:
                continue

            # Buscar VIT que referencien esta VUL
            for vit in vit_data:
                vit_num = str(vit.get("numero", "")).strip()
                vit_vul_field = str(vit.get("VUL", "")).strip()
                if vit_vul_field == vul_num and vit_num:
                    before_vits = str(vul.get("VITS", "")).strip()
                    after_vits = (
                        (before_vits + "," + vit_num).strip(",")
                        if before_vits
                        else vit_num
                    )
                    if vit_num not in [
                        s.strip() for s in before_vits.split(",") if s.strip()
                    ]:
                        relations.append(
                            {
                                "vulNumero": vul_num,
                                "vitNumero": vit_num,
                                "before": before_vits,
                                "after": after_vits,
                            }
                        )

        # Flujo de respuesta/guardado
        if not duplicates:
            if relations:
                # NO guardar todavía si hay relaciones. Devolver para confirmación en frontend.
                response = JsonResponse(
                    {
                        "message": "Relations detected",
                        "new": unique_new_entries,
                        "duplicates": [],
                        "relations": relations,
                    }
                )
            else:
                # Sin duplicados ni relaciones: guardado directo
                updated_data = assign_ids_and_merge_vul(
                    existing_data, unique_new_entries
                )
                VUL_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
                with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
                    json.dump(updated_data, tmp, ensure_ascii=False, indent=2)
                    tmp_name = tmp.name
                os.replace(tmp_name, VUL_JSON_PATH)
                response = JsonResponse(
                    {
                        "message": "Data added successfully",
                        "new": [],
                        "duplicates": [],
                        "relations": [],
                    }
                )
        else:
            # Si hay duplicados, devolverlos junto con relaciones (NO guardar aún)
            response = JsonResponse(
                {
                    "message": "Duplicates detected",
                    "new": unique_new_entries,
                    "duplicates": duplicates,
                    "relations": relations,
                }
            )

    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(response)
