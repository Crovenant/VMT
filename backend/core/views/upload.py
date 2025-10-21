# backend/core/views/upload.py

import json
import os
import pandas as pd
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from .utils import add_cors_headers
from .normalize import normalize_headers
from .duplicates import detect_duplicates
from .risk_logic import assign_ids_and_merge

JSON_FILENAME = 'risk_Data.json'  # respetando tu nombre de archivo

@csrf_exempt
def upload_data(request):
    if request.method == 'OPTIONS':
        return add_cors_headers(JsonResponse({'message': 'Preflight OK'}))

    if request.method != 'POST':
        return add_cors_headers(JsonResponse({'error': 'Method not allowed'}, status=405))

    try:
        if 'file' not in request.FILES:
            raise ValueError("No file was uploaded.")

        excel_file = request.FILES['file']
        df = pd.read_excel(excel_file, engine='openpyxl')
        df = normalize_headers(df)

        new_entries = df.to_dict(orient='records')
        json_path = os.path.join(settings.BASE_DIR, JSON_FILENAME)

        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        # Detección con clave compuesta normalizada
        duplicates, unique_new_entries = detect_duplicates(existing_data, new_entries)

        if not duplicates:
            # Caso “todo nuevo”: merge directo con IDs únicos incrementales
            updated_data = assign_ids_and_merge(existing_data, unique_new_entries)
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(updated_data, f, ensure_ascii=False, indent=2)

            response = JsonResponse({
                'message': 'Data added successfully',
                'new': [],
                'duplicates': []
            })
        else:
            # Mantengo tu flujo: no se persiste nada aquí si hay duplicados.
            # (El resolver posterior que use assign_ids_and_merge ya no generará IDs repetidos.)
            response = JsonResponse({
                'message': 'Duplicates detected',
                'new': unique_new_entries,
                'duplicates': duplicates
            }, safe=False)

    except Exception as e:
        response = JsonResponse({'error': str(e)}, status=400)

    return add_cors_headers(response)