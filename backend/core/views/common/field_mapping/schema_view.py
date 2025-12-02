# core/views/common/field_mapping/schema_view.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from core.views.common.utils import add_cors_headers
from .schema_manager import get_all_schemas, get_schema, add_new_fields


def _options_ok():
    return add_cors_headers(JsonResponse({"message": "Preflight OK"}))


@csrf_exempt
def get_all_schemas_view(request):
    if request.method == "OPTIONS":
        return _options_ok()
    if request.method != "GET":
        return add_cors_headers(JsonResponse({"error": "Method not allowed"}, status=405))
    data = get_all_schemas()
    return add_cors_headers(JsonResponse(data))


@csrf_exempt
def get_schema_view(request, view_type: str):
    if request.method == "OPTIONS":
        return _options_ok()
    if request.method != "GET":
        return add_cors_headers(JsonResponse({"error": "Method not allowed"}, status=405))
    fields = get_schema(view_type)
    payload = {"viewType": view_type.upper(), "fields": fields}
    return add_cors_headers(JsonResponse(payload))


@csrf_exempt
def apply_new_fields_view(request):
    if request.method == "OPTIONS":
        return _options_ok()
    if request.method != "POST":
        return add_cors_headers(JsonResponse({"error": "Method not allowed"}, status=405))
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return add_cors_headers(JsonResponse({"error": "Invalid JSON"}, status=400))
    view_type = data.get("viewType")
    new_fields = data.get("newFields")
    if not view_type or not isinstance(new_fields, (list, tuple)):
        return add_cors_headers(JsonResponse({"error": "Invalid payload"}, status=400))
    added = add_new_fields(view_type, new_fields)
    fields = get_schema(view_type)
    return add_cors_headers(JsonResponse({"ok": True, "added": added, "fields": fields}))
