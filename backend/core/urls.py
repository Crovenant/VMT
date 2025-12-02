from django.urls import path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from core.views.VIT.list_view import get_vit_risk_data
from core.views.VIT.upload import upload_data as vit_upload_data
from core.views.VIT.save_selection import save_selection as vit_save_selection
from core.views.VIT.apply_relations import apply_relations
from core.views.VIT import delete_selection as vit_delete_selection
from core.views.VIT.comments import vit_comments_view

from core.views.VUL.list_view import get_vul_risk_data
from core.views.VUL.upload import upload_data as vul_upload_data
from core.views.VUL.save_selection import save_selection as vul_save_selection
from core.views.VUL.apply_relations import apply_relations_vul
from core.views.VUL import delete_selection as vul_delete_selection
from core.views.VUL.comments import vul_comments_view

from core.views.common.field_mapping.schema_view import (
    get_all_schemas_view,
    get_schema_view,
    apply_new_fields_view,
)


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
                    "apply-relations": "/vit/apply-relations/",
                    "delete": "/vit/delete-selection/",
                    "comments": "/vit/comments/<numero>/",
                },
                "VUL": {
                    "list": "/vul/risk-data/",
                    "upload": "/vul/upload/",
                    "save": "/vul/save-selection/",
                    "apply-relations": "/vul/apply-relations/",
                    "delete": "/vul/delete-selection/",
                    "comments": "/vul/comments/<numero>/",
                },
            },
        }
    )


urlpatterns = [
    path("", home_view),
    path("schema/", get_all_schemas_view),
    path("schema/<str:view_type>/", get_schema_view),
    path("schema/apply-new-fields/", apply_new_fields_view),
    path("vit/risk-data/", get_vit_risk_data),
    path("vit/upload/", vit_upload_data),
    path("vit/save-selection/", vit_save_selection),
    path("vit/apply-relations/", apply_relations),
    path("vit/delete-selection/", vit_delete_selection.delete_selection),
    path("vit/comments/<str:numero>/", vit_comments_view),
    path("vul/risk-data/", get_vul_risk_data),
    path("vul/upload/", vul_upload_data),
    path("vul/save-selection/", vul_save_selection),
    path("vul/apply-relations/", apply_relations_vul),
    path("vul/delete-selection/", vul_delete_selection.delete_selection),
    path("vul/comments/<str:numero>/", vul_comments_view),
]
