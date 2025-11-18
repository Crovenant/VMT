import json
from pathlib import Path
from django.apps import apps

# Directorio del app 'core' → .../backend/core
CORE_DIR = Path(apps.get_app_config("core").path)
# Carpeta de datos → .../backend/core/data
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Mapa de equivalencias para migración de nombres de ficheros
FILE_ALIASES = {
    "vit_Data.json": ["tshirt_Data.json"],
    "vul_Data.json": ["soup_Data.json"],
    "tshirt_Data.json": ["vit_Data.json"],
    "soup_Data.json": ["vul_Data.json"],
}

def _resolve_data_file(filename: str) -> Path:
    """
    Devuelve una ruta existente para filename con fallback a sus alias.
    Soporta subcarpetas (ej: CSIRT/vit_Data.json).
    """
    primary = DATA_DIR / filename
    if primary.exists():
        return primary

    # Si filename incluye subcarpeta, separar nombre base para alias
    base_name = Path(filename).name
    subdir = Path(filename).parent

    # Buscar alias en la misma subcarpeta
    for alt in FILE_ALIASES.get(base_name, []):
        alt_path = DATA_DIR / subdir / alt
        if alt_path.exists():
            return alt_path

    # Si no existe nada, devolvemos la ruta primaria (para crearlo si guardas)
    return primary

def load_json_data(filename: str = "CSIRT/vit_Data.json"):
    """
    Carga JSON desde backend/core/data/<filename> con fallback a alias.
    Por defecto asumimos VIT en CSIRT.
    """
    file_path = _resolve_data_file(filename)
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
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response