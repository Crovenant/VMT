# src: core/views/VUL/update.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os


@csrf_exempt
def update_status(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data = json.loads(request.body.decode("utf-8"))
        item_id = str(data.get("id", "")).strip()
        estado = str(data.get("estado", "")).strip()
        if not item_id or not estado:
            return JsonResponse({"error": "Datos inválidos"}, status=400)
        file_path = os.path.join(
            os.path.dirname(__file__), "../../common/data/vul_Data.json"
        )
        file_path = os.path.abspath(file_path)
        with open(file_path, "r", encoding="utf-8") as f:
            vul_data = json.load(f)
        updated = False
        for item in vul_data:
            if str(item.get("id") or item.get("numero")) == item_id:
                item["estado"] = estado
                updated = True
                break
        if not updated:
            return JsonResponse({"error": "ID no encontrado"}, status=404)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(vul_data, f, ensure_ascii=False, indent=2)
        return JsonResponse(
            {"success": True, "id": item_id, "estado": estado}, status=200
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
