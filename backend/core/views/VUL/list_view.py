from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from core.views.common.utils import add_cors_headers, load_json_data, add_has_link
from core.views.VUL.risk_logic import enrich_vul

@csrf_exempt
def get_vul_risk_data(request):
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))
    if request.method != "GET":
        return add_cors_headers(JsonResponse({"error": "Método no permitido"}, status=405))
    try:
        # Cargar datos base
        vit_data = load_json_data("CSIRT/vit_Data.json")
        vul_data = load_json_data("CSIRT/vul_Data.json")

        # Añadir hasLink
        _, vul_data = add_has_link(vit_data, vul_data)

        # Enriquecer VUL con lista completa de VIT asociadas
        vul_data = enrich_vul(vul_data, vit_data)

        # Responder con datos completos
        response = JsonResponse(vul_data, safe=False)
    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=500)
    return add_cors_headers(response)