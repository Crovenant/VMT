from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from core.views.tshirt.upload import upload_data
from core.views.tshirt.save_selection import save_selection
from core.views.tshirt.list_view import get_risk_data
from core.views.common.utils import add_cors_headers  # si lo usas

@csrf_exempt
def home_view(request):
    response = JsonResponse({"message": "Welcome to the Core app"})
    return add_cors_headers(response)

urlpatterns = [
    path("", home_view),
    path("risk-data/", get_risk_data),
    path("upload_data/", upload_data),
    path("save_selection/", save_selection),
]
