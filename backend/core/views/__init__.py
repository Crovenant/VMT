# backend/core/views/__init__.py
# Opcional: shims de compatibilidad (borra cuando limpies imports)
from .tshirt import list_view, upload, save_selection  # noqa: F401
from .common.utils import add_cors_headers, load_json_data  # noqa: F401