from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from core.views.common.utils import add_cors_headers, load_json_data


@csrf_exempt
def get_vul_risk_data(request):
    """
    NUEVO (VUL): /vul/risk-data/ → fuente única VUL (vul_Data.json)
    """
    # Preflight CORS
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))

    if request.method != "GET":
        return add_cors_headers(JsonResponse({"error": "Método no permitido"}, status=405))

    try:
        # ✅ Ajuste: ahora vul_Data.json está en data/CSIRT/
        data = load_json_data("CSIRT/vul_Data.json")
        response = JsonResponse(data, safe=False)
    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=500)

    return add_cors_headers(response)