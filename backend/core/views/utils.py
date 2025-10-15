import json
import os
from django.conf import settings

def load_json_data(filename='risk_Data.json'):
    file_path = os.path.join(settings.BASE_DIR, filename)
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def add_cors_headers(response):
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    return response