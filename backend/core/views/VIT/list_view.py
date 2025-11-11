# backend/core/views/VIT/list_view.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from core.views.common.utils import add_cors_headers, load_json_data


@csrf_exempt
def get_risk_data(request):
    """
    LEGACY (TSHIRT): mantiene /risk-data/ para no romper clientes antiguos.
    Internamente lee el dataset VIT (vit_Data.json).
    """
    # Preflight CORS
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "GET":
        return add_cors_headers(JsonResponse({"error": "Método no permitido"}, status=405))

    try:
        data = load_json_data("vit_Data.json")
        response = JsonResponse(data, safe=False)
    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=500)

    return add_cors_headers(response)


@csrf_exempt
def get_vit_risk_data(request):
    """
    NUEVO (VIT): /vit/risk-data/ → fuente única VIT (vit_Data.json)
    """
    # Preflight CORS
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "GET":
        return add_cors_headers(JsonResponse({"error": "Método no permitido"}, status=405))

    try:
        data = load_json_data("vit_Data.json")
        response = JsonResponse(data, safe=False)
    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=500)

    return add_cors_headers(response)
