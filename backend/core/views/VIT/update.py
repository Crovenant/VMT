# src: core/views/VIT/update.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from datetime import datetime

CLOSED_STATES = {"Cerrado", "Closed"}
DUE_DATE_FIELD = "dueDate"


def _parse_yyyy_mm_dd(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str.strip(), "%Y-%m-%d")
    except ValueError:
        return None


@csrf_exempt
def update_status(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data = json.loads(request.body.decode("utf-8"))
        numero = str(data.get("numero", "")).strip()
        estado = str(data.get("estado", "")).strip()

        if not numero or not estado:
            return JsonResponse({"error": "Datos inválidos"}, status=400)

        file_path = os.path.join(
            os.path.dirname(__file__),
            "../../data/CSIRT/vit_Data.json",
        )
        file_path = os.path.abspath(file_path)

        with open(file_path, "r", encoding="utf-8") as f:
            vit_data = json.load(f)

        updated = False
        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")

        for item in vit_data:
            current_num = str(item.get("numero") or "").strip()
            if current_num != numero:
                continue

            previous_state = str(item.get("estado", "")).strip()
            item["estado"] = estado

            if estado in CLOSED_STATES:
                if not item.get("closedDate"):
                    item["closedDate"] = today_str
                    due_raw = item.get(DUE_DATE_FIELD)
                    due_dt = _parse_yyyy_mm_dd(due_raw)
                    if due_dt is not None:
                        delta_days = (now.date() - due_dt.date()).days
                        item["closedDelayDays"] = delta_days
                        item["overdue"] = bool(delta_days > 0)
                    else:
                        item["closedDelayDays"] = None
                        item["overdue"] = None
            else:
                if previous_state in CLOSED_STATES:
                    item.pop("closedDate", None)
                    item.pop("closedDelayDays", None)
                    item.pop("overdue", None)

            updated = True
            break

        if not updated:
            return JsonResponse({"error": "Número no encontrado"}, status=404)

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(vit_data, f, ensure_ascii=False, indent=2)

        return JsonResponse(
            {"success": True, "numero": numero, "estado": estado}, status=200
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
