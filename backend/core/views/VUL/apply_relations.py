# core/views/VUL/apply_relations.py
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
VIT_JSON_PATH = DATA_DIR / "CSIRT" / "vit_Data.json"


@csrf_exempt
def apply_relations_vul(request):
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

        # Leer datos existentes
        vul_data = []
        vit_data = []

        if VUL_JSON_PATH.exists():
            with VUL_JSON_PATH.open("r", encoding="utf-8") as f:
                vul_data = json.load(f)
        if VIT_JSON_PATH.exists():
            with VIT_JSON_PATH.open("r", encoding="utf-8") as f:
                vit_data = json.load(f)

        if not isinstance(vul_data, list):
            vul_data = [vul_data]
        if not isinstance(vit_data, list):
            vit_data = [vit_data]

        vul_map = {str(v.get("Número", "")).strip(): v for v in vul_data}
        vit_map = {str(v.get("numero", "")).strip(): v for v in vit_data}

        # Aplicar relaciones inversas
        for rel in relations:
            vul_num = str(rel.get("vulNumero", "")).strip()
            vit_num = str(rel.get("vitNumero", "")).strip()

            # Actualizar VUL (añadir vit_num en VITS)
            if vul_num in vul_map:
                vul_obj = vul_map[vul_num]
                current_vits = str(vul_obj.get("VITS", "")).strip()
                current_list = [s.strip() for s in current_vits.split(",") if s.strip()]
                if vit_num not in current_list:
                    current_list.append(vit_num)
                    vul_obj["VITS"] = ",".join(current_list)

            # Actualizar VIT (añadir vul_num en VUL)
            if vit_num in vit_map:
                vit_obj = vit_map[vit_num]
                current_vul = str(vit_obj.get("VUL", "")).strip()
                if vul_num and vul_num != current_vul:
                    vit_obj["VUL"] = vul_num

        # Guardar cambios en ambos archivos
        VUL_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp_vul:
            json.dump(list(vul_map.values()), tmp_vul, ensure_ascii=False, indent=2)
            tmp_vul_name = tmp_vul.name
        os.replace(tmp_vul_name, VUL_JSON_PATH)

        with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp_vit:
            json.dump(list(vit_map.values()), tmp_vit, ensure_ascii=False, indent=2)
            tmp_vit_name = tmp_vit.name
        os.replace(tmp_vit_name, VIT_JSON_PATH)

        response = JsonResponse({"message": "Relations applied successfully."})

    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=400)

    return add_cors_headers(response)
