# backend/core/views/list_view.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import add_cors_headers, load_json_data

@csrf_exempt
def get_risk_data(request):
    if request.method == 'GET':
        try:
            data = load_json_data()
            response = JsonResponse(data, safe=False)
        except Exception as e:
            response = JsonResponse({'error': str(e)}, status=500)
    else:
        response = JsonResponse({'error': 'Método no permitido'}, status=405)

    return add_cors_headers(response)