# backend/core/views/VUL/list_view.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from core.views.common.utils import add_cors_headers, load_json_data

@csrf_exempt
def get_vul_risk_data(request):
    """
    NUEVO (VUL): /vul/risk-data/ → fuente única VUL (vul_Data.json)
    Devuelve el dataset con los campos:
    id, Número, Activo, Elementos vulnerables, Asignado a,
    Grupo de asignación, Prioridad, Estado, Actualizado, VITS
    """
    # Preflight CORS
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "GET":
        return add_cors_headers(JsonResponse({"error": "Método no permitido"}, status=405))

    try:
        data = load_json_data("vul_Data.json")
        resp = JsonResponse(data, safe=False)
    except Exception as e:
        resp = JsonResponse({"error": str(e)}, status=500)

    return add_cors_headers(resp)