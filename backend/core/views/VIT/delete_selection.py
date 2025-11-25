# core/views/VIT/delete_selection.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import os

DATA_FILE = os.path.join(settings.BASE_DIR, "core", "data", "CSIRT", "vit_Data.json")


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

        new_data = []
        for item in data:
            id_variants = {
                str(item.get("id")),
                str(item.get("numero")),
                str(item.get("Número")),
            }
            if ids_to_delete.isdisjoint(id_variants):
                new_data.append(item)

        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)

        return JsonResponse({"status": "success", "deleted": len(ids_to_delete)})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
