from django.urls import path
from core.views.upload import upload_data
from core.views.save_selection import save_selection
from core.views.list_view import get_risk_data
from core.views.utils import add_cors_headers  # solo si se usa en alguna vista directa
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
@csrf_exempt
def home_view(request):
    response = JsonResponse({"message": "Welcome to the Core app"})
    return add_cors_headers(response)

urlpatterns = [
    path('', home_view),
    path('risk-data/', get_risk_data),
    path('upload_data/', upload_data),
    path('save_selection/', save_selection),
]