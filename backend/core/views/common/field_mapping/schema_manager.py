# core/views/common/field_mapping/schema_manager.py
import json
import os
from pathlib import Path
from typing import List, Dict
import pandas as pd
from django.apps import apps

CORE_DIR = Path(apps.get_app_config("core").path)
FIELD_MAPS_PATH = CORE_DIR / "views" / "common" / "field_mapping" / "field_maps.json"
FIELD_HISTORY_PATH = (
    CORE_DIR / "views" / "common" / "field_mapping" / "field_maps_history.json"
)


def _load_json(path: Path) -> Dict:
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save_json(path: Path, data: Dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_schema(view_type: str) -> List[str]:
    maps = _load_json(FIELD_MAPS_PATH)
    return maps.get(view_type.upper(), [])


def update_schema(view_type: str, new_fields: List[str]) -> Dict:
    maps = _load_json(FIELD_MAPS_PATH)
    history = _load_json(FIELD_HISTORY_PATH)
    vt = view_type.upper()
    current = maps.get(vt, [])
    updated = list(current)
    for f in new_fields:
        if f not in updated:
            updated.append(f)
    maps[vt] = updated
    history_entry = {"viewType": vt, "previous": current, "newFields": new_fields}
    history.setdefault("changes", []).append(history_entry)
    _save_json(FIELD_MAPS_PATH, maps)
    _save_json(FIELD_HISTORY_PATH, history)
    return maps


def rollback_schema(view_type: str) -> Dict:
    maps = _load_json(FIELD_MAPS_PATH)
    history = _load_json(FIELD_HISTORY_PATH)
    vt = view_type.upper()
    changes = history.get("changes", [])
    for i in range(len(changes) - 1, -1, -1):
        if changes[i]["viewType"] == vt:
            maps[vt] = changes[i]["previous"]
            changes.pop(i)
            break
    history["changes"] = changes
    _save_json(FIELD_MAPS_PATH, maps)
    _save_json(FIELD_HISTORY_PATH, history)
    return maps


def normalize(df: pd.DataFrame, view_type: str) -> pd.DataFrame:
    schema = get_schema(view_type)
    out = df.copy()
    out.columns = [str(c).strip() for c in out.columns]
    for col in schema:
        if col not in out.columns:
            out[col] = ""
    return out[schema]


def merge_entries(existing: List[Dict], new: List[Dict], view_type: str) -> List[Dict]:
    schema = get_schema(view_type)
    merged = list(existing)
    for entry in new:
        clean = {k: str(entry.get(k, "")) for k in schema}
        merged.append(clean)
    return merged
