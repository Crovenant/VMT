from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

try:
    from core.views.common.utils import add_cors_headers
except Exception:
    add_cors_headers = None

@csrf_exempt
def soup_save_selection(request):
    # Stub para guardar selección/flags.
    resp = JsonResponse({"ok": True, "msg": "SOUP save_selection stub"})
    if add_cors_headers:
        resp = add_cors_headers(resp)
    return resp
