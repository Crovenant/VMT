import json
from json import JSONDecodeError

from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt

from core.views.common.comments import get_comments_for, append_comment


@csrf_exempt
def vul_comments_view(request: HttpRequest, numero: str):
    if request.method == "GET":
        comments = get_comments_for("vul", numero)
        return JsonResponse(comments, safe=False)

    if request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON body"}, status=400)

        text = (payload.get("text") or "").strip()
        author = payload.get("author") or "system"

        if not text:
            return JsonResponse({"error": "Field 'text' is required"}, status=400)

        comments = append_comment("vul", numero, text=text, author=author)
        return JsonResponse(comments, safe=False, status=201)

    return JsonResponse({"error": "Method not allowed"}, status=405)
