# core/views/VUL/list_view.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from core.views.common.utils import add_cors_headers, load_json_data
from core.views.VUL.risk_logic import enrich_vul, sanitize_upload_payload


@csrf_exempt
def get_vul_risk_data(request):
    if request.method == "OPTIONS":
        return add_cors_headers(JsonResponse({"message": "Preflight OK"}))
    if request.method != "GET":
        return add_cors_headers(
            JsonResponse({"error": "Método no permitido"}, status=405)
        )
    try:
        vit_data = load_json_data("CSIRT/vit_Data.json")
        vul_data = load_json_data("CSIRT/vul_Data.json")

        vul_data = enrich_vul(vul_data, vit_data)
        vul_data = [sanitize_upload_payload(e) for e in vul_data]

        response = JsonResponse(vul_data, safe=False)
    except Exception as e:
        response = JsonResponse({"error": str(e)}, status=500)
    return add_cors_headers(response)
