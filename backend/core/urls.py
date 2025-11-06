# core/urls.py
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from core.views.tshirt.upload import upload_data
from core.views.tshirt.save_selection import save_selection
from core.views.tshirt.list_view import get_risk_data

# SOUP
from core.views.soup.list_view import soup_get_risk_data
from core.views.soup.upload import soup_upload_data
from core.views.soup.save_selection import soup_save_selection

# Si usas este helper para CORS
from core.views.common.utils import add_cors_headers  # noqa: F401


@csrf_exempt
def home_view(request):
    response = JsonResponse({"message": "Welcome to the Core app"})
    # Si tienes add_cors_headers, descomenta la siguiente línea:
    # return add_cors_headers(response)
    return response


urlpatterns = [
    path("", home_view),

    # --- TSHIRT ---
    path("risk-data/", get_risk_data),
    path("upload_data/", upload_data),
    path("save_selection/", save_selection),

    # --- SOUP ---
    # Estos tres endpoints son los que espera tu frontend:
    path("soup/risk-data/", soup_get_risk_data),
    path("soup/upload_data/", soup_upload_data),
    path("soup/save_selection/", soup_save_selection),
]
