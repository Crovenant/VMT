# backend/core/views/common/utils.py
import json
from pathlib import Path
from django.apps import apps

# Directorio del app 'core' → .../backend/core
CORE_DIR = Path(apps.get_app_config("core").path)
# Carpeta de datos → .../backend/core/data
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

def load_json_data(filename: str = "tshirt_Data.json"):
    """
    Carga JSON desde backend/core/data/<filename>.
    Por defecto lee 'tshirt_Data.json'.
    Si no existe, devuelve [].
    """
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return []
    with file_path.open("r", encoding="utf-8") as f:
        return json.load(f)

def add_cors_headers(response):
    """
    Añade cabeceras CORS abiertas.
    """
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    return response
