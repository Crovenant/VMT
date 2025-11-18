import json
from pathlib import Path
from django.apps import apps

CORE_DIR = Path(apps.get_app_config("core").path)
DATA_DIR = CORE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

FILE_ALIASES = {
    "vit_Data.json": ["tshirt_Data.json"],
    "vul_Data.json": ["soup_Data.json"],
    "tshirt_Data.json": ["vit_Data.json"],
    "soup_Data.json": ["vul_Data.json"],
}

def _resolve_data_file(filename: str) -> Path:
    primary = DATA_DIR / filename
    if primary.exists():
        return primary
    base_name = Path(filename).name
    subdir = Path(filename).parent
    for alt in FILE_ALIASES.get(base_name, []):
        alt_path = DATA_DIR / subdir / alt
        if alt_path.exists():
            return alt_path
    return primary

def load_json_data(filename: str):
    file_path = _resolve_data_file(filename)
    if not file_path.exists():
        return []
    with file_path.open("r", encoding="utf-8") as f:
        return json.load(f)

def add_cors_headers(response):
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

def add_has_link(vit_data: list[dict], vul_data: list[dict]) -> tuple[list[dict], list[dict]]:
    linked_codes = set()

    # Recolectar todos los códigos VIT que aparecen en VUL
    for vul in vul_data:
        vits_field = vul.get("VITS") or vul.get("vits", "")
        if vits_field:
            for code in str(vits_field).split(","):
                code = code.strip()
                if code:
                    linked_codes.add(code)

    # Marcar VUL con hasLink si tiene VITS
    for vul in vul_data:
        vits_field = vul.get("VITS") or vul.get("vits", "")
        vul["hasLink"] = bool(vits_field and str(vits_field).strip() != "")

    # Marcar VIT con hasLink si su número aparece en linked_codes
    for vit in vit_data:
        numero = vit.get("numero") or vit.get("Número", "")
        vit["hasLink"] = str(numero).strip() in linked_codes

    return vit_data, vul_data