# core/views/VIT/apply_relations.py
import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from django.apps import apps
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from core.views.common.utils import add_cors_headers

CORE_DIR = Path(apps.get_app_config("core").path)
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

VUL_JSON_PATH = DATA_DIR / "CSIRT" / "vul_Data.json"


@csrf_exempt
def apply_relations(request):
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "POST":
        return add_cors_headers(
            JsonResponse({"error": "Method not allowed"}, status=405)
        )

    try:
        body = json.loads(request.body.decode("utf-8"))
        relations = body.get("relations", [])

        if not isinstance(relations, list) or not relations:
            raise ValueError("No relations provided.")

        if VUL_JSON_PATH.exists():
            with VUL_JSON_PATH.open("r", encoding="utf-8") as f:
                vul_data = json.load(f)
        else:
            vul_data = []

        if not isinstance(vul_data, list):
            vul_data = [vul_data]

        vul_map = {str(v.get("numero", "")).strip(): v for v in vul_data}

        for rel in relations:
            vul_num = str(rel.get("vulNumero", "")).strip()
            vit_num = str(rel.get("vitNumero", "")).strip()
            if vul_num and vit_num and vul_num in vul_map:
                vul_obj = vul_map[vul_num]
                current_vits = str(vul_obj.get("vits", "")).strip()
                if vit_num not in current_vits.split(","):
                    new_vits = (
                        (current_vits + "," + vit_num).strip(",")
                        if current_vits
                        else vit_num
                    )
                    vul_obj["vits"] = new_vits

        updated_data = list(vul_map.values())
        with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
            json.dump(updated_data, tmp, ensure_ascii=False, indent=2)
            tmp_name = tmp.name
        os.replace(tmp_name, VUL_JSON_PATH)

        response = JsonResponse({"message": "Relations applied successfully."})

    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(response)
