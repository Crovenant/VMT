# backend/core/views/__init__.py
# Clean exports (sin legacy)
from .VIT import list_view as vit_list_view, upload as vit_upload, save_selection as vit_save_selection
from .VUL import list_view as vul_list_view, upload as vul_upload, save_selection as vul_save_selection

__all__ = [
    "vit_list_view", "vit_upload", "vit_save_selection",
    "vul_list_view", "vul_upload", "vul_save_selection",
]
