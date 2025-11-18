from django.urls import path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# ===== VIT =====
from core.views.VIT.list_view import get_vit_risk_data
from core.views.VIT.upload import upload_data as vit_upload_data
from core.views.VIT.save_selection import save_selection as vit_save_selection

# ===== VUL =====
from core.views.VUL.list_view import get_vul_risk_data
from core.views.VUL.upload import upload_data as vul_upload_data
from core.views.VUL.save_selection import save_selection as vul_save_selection


@csrf_exempt
def home_view(_request):
    return JsonResponse(
        {
            "ok": True,
            "endpoints": {
                "VIT": {
                    "list": "/vit/risk-data/",
                    "upload": "/vit/upload/",
                    "save": "/vit/save-selection/",
                },
                "VUL": {
                    "list": "/vul/risk-data/",
                    "upload": "/vul/upload/",
                    "save": "/vul/save-selection/",
                },
            }
        }
    )

urlpatterns = [
    path("", home_view),

    # ======== ENDPOINTS VIT ========
    path("vit/risk-data/", get_vit_risk_data),
    path("vit/upload/", vit_upload_data),
    path("vit/save-selection/", vit_save_selection),

    # ======== ENDPOINTS VUL ========
    path("vul/risk-data/", get_vul_risk_data),
    path("vul/upload/", vul_upload_data),
    path("vul/save-selection/", vul_save_selection),
]