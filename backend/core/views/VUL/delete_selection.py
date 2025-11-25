# core/views/VUL/delete_selection.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import os

DATA_FILE = os.path.join(settings.BASE_DIR, "core", "data", "CSIRT", "vul_Data.json")


@csrf_exempt
def delete_selection(request):
    if request.method != "DELETE":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        body = json.loads(request.body)
        ids_to_delete = set(str(i) for i in body.get("ids", []))
        if not os.path.exists(DATA_FILE):
            return JsonResponse(
                {"error": f"Archivo no encontrado: {DATA_FILE}"}, status=500
            )
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        new_data = [
            item
            for item in data
            if str(item.get("id") or item.get("Número")) not in ids_to_delete
        ]
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)
        return JsonResponse({"status": "success", "deleted": len(ids_to_delete)})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
