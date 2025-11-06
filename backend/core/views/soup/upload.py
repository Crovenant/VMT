from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

try:
    from core.views.common.utils import add_cors_headers
except Exception:
    add_cors_headers = None

@csrf_exempt
def soup_upload_data(request):
    # Stub para que el front funcione. Aquí parseas y guardas el Excel/CSV de SOUP.
    resp = JsonResponse({"ok": True, "msg": "SOUP upload stub"})
    if add_cors_headers:
        resp = add_cors_headers(resp)
    return resp
