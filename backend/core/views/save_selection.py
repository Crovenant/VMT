import json
import os
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from .utils import add_cors_headers
from .duplicates import build_lookup
from .risk_logic import update_selected_entries

@csrf_exempt
def save_selection(request):
    if request.method == 'OPTIONS':
        return add_cors_headers(JsonResponse({'message': 'Preflight OK'}))

    if request.method != 'POST':
        return add_cors_headers(JsonResponse({'error': 'Method not allowed'}, status=405))

    try:
        print("📥 Recibiendo datos en save_selection...")

        body = json.loads(request.body)
        print("🔍 Cuerpo recibido:", body)

        selected_entries = body.get("entries", [])
        print("📋 Entradas seleccionadas:", selected_entries)

        if not isinstance(selected_entries, list):
            raise ValueError("Invalid data format.")

        json_path = os.path.join(settings.BASE_DIR, 'risk_Data.json')

        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        # 🔄 Uso de función modular para construir el diccionario de búsqueda
        lookup = build_lookup(existing_data)

        # 🔄 Uso de función modular para actualizar y fusionar los datos
        final_data = update_selected_entries(existing_data, selected_entries, lookup)

        print("🧾 Datos finales que se van a guardar:", json.dumps(final_data, indent=2, ensure_ascii=False))

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)

        print("✅ Datos guardados correctamente en risk_Data.json")

        response = JsonResponse({'message': 'Selection saved successfully'})
    except Exception as e:
        print("❌ Error en save_selection:", str(e))
        response = JsonResponse({'error': str(e)}, status=400)

    return add_cors_headers(response)