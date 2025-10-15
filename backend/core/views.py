import json
import os
import pandas as pd
from collections import OrderedDict
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

def add_cors_headers(response):
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@csrf_exempt
def home_view(request):
    response = JsonResponse({"message": "Welcome to the Core app"})
    return add_cors_headers(response)

@csrf_exempt
def get_risk_data(request):
    try:
        file_path = os.path.join(settings.BASE_DIR, 'risk_Data.json')
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        response = JsonResponse(data, safe=False)
    except Exception as e:
        response = JsonResponse({'error': str(e)}, status=500)
    return add_cors_headers(response)

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

        header_mapping = {
            "Número": "numero",
            "ID externo": "idExterno",
            "Estado": "estado",
            "Resumen": "resumen",
            "Breve descripción": "breveDescripcion",
            "Elemento de configuración": "elementoConfiguracion",
            "Prioridad": "prioridad",
            "Puntuación de riesgo": "puntuacionRiesgo",
            "Grupo de asignación": "grupoAsignacion",
            "Asignado a": "asignadoA",
            "Creado": "creado",
            "Actualizado": "actualizado",
            "Sites": "sites",
            "Vulnerability solution": "vulnerabilitySolution",
            "Vulnerabilidad": "vulnerabilidad"
        }

        df.rename(columns=header_mapping, inplace=True)

        if 'puntuacionRiesgo' in df.columns:
            df['puntuacionRiesgo'] = pd.to_numeric(df['puntuacionRiesgo'], errors='coerce')

        for col in ['creado', 'actualizado']:
            if col in df.columns:
                df[col] = df[col].astype(str)

        new_entries = df.to_dict(orient='records')
        json_path = os.path.join(settings.BASE_DIR, 'risk_Data.json')

        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        if not isinstance(existing_data, list):
            existing_data = [existing_data]

        duplicates = []
        unique_new_entries = []

        existing_by_id = {item.get("idExterno"): item for item in existing_data if item.get("idExterno")}
        existing_by_num = {item.get("numero"): item for item in existing_data if item.get("numero")}

        for entry in new_entries:
            id_key = entry.get("idExterno")
            num_key = entry.get("numero")

            if id_key in existing_by_id:
                duplicates.append({
                    "existing": existing_by_id[id_key],
                    "incoming": entry
                })
            elif num_key in existing_by_num:
                duplicates.append({
                    "existing": existing_by_num[num_key],
                    "incoming": entry
                })
            else:
                unique_new_entries.append(entry)

        if not duplicates:
            last_id = max((item.get("id", 0) for item in existing_data), default=0)
            for i, entry in enumerate(unique_new_entries, start=1):
                entry_ordered = OrderedDict()
                entry_ordered["id"] = last_id + i
                for key in entry:
                    if key != "id":
                        entry_ordered[key] = entry[key]
                existing_data.append(entry_ordered)

            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, ensure_ascii=False, indent=2)

            response = JsonResponse({'message': 'Data added successfully', 'new': [], 'duplicates': []})
        else:
            response = JsonResponse({
                'message': 'Duplicates detected',
                'new': unique_new_entries,
                'duplicates': duplicates
            }, safe=False)

    except Exception as e:
        response = JsonResponse({'error': str(e)}, status=400)

    return add_cors_headers(response)

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

        lookup = {
            (item.get("idExterno"), item.get("numero")): item
            for item in existing_data
        }

        updated_data = []
        used_keys = set()

        for entry in selected_entries:
            key = (entry.get("idExterno"), entry.get("numero"))
            entry_ordered = OrderedDict()
            entry_ordered["id"] = lookup.get(key, {}).get("id", None) or (
                max((item.get("id", 0) for item in existing_data), default=0) + 1
            )
            for k in entry:
                if k != "id":
                    entry_ordered[k] = entry[k]
            used_keys.add(key)
            updated_data.append(entry_ordered)

        final_data = [
            item for item in existing_data
            if (item.get("idExterno"), item.get("numero")) not in used_keys
        ] + updated_data

        print("🧾 Datos finales que se van a guardar:", json.dumps(final_data, indent=2, ensure_ascii=False))

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)

        print("✅ Datos guardados correctamente en risk_Data.json")

        response = JsonResponse({'message': 'Selection saved successfully'})
    except Exception as e:
        print("❌ Error en save_selection:", str(e))
        response = JsonResponse({'error': str(e)}, status=400)

    return add_cors_headers(response)