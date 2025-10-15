from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import add_cors_headers, load_json_data

@csrf_exempt
def get_risk_data(request):
    try:
        data = load_json_data()
        response = JsonResponse(data, safe=False)
    except Exception as e:
        response = JsonResponse({'error': str(e)}, status=500)
    return add_cors_headers(response)