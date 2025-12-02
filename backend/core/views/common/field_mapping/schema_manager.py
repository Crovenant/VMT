# core/views/common/field_mapping/schema_manager.py
import json
import os
import re
import unicodedata
from datetime import datetime
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Dict, List, Sequence

import pandas as pd
from django.apps import apps

CORE_DIR = Path(apps.get_app_config("core").path)
FIELD_MAPS_PATH = CORE_DIR / "views" / "common" / "field_mapping" / "field_maps.json"
FIELD_HISTORY_PATH = CORE_DIR / "views" / "common" / "field_mapping" / "field_maps_history.json"


def _load_json(path: Path, default):
    try:
        if path.exists():
            with path.open("r", encoding="utf-8") as f:
                return json.load(f)
    except json.JSONDecodeError:
        return default
    return default


def _save_json(path: Path, data: Dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile("w", delete=False, encoding="utf-8") as tmp:
        json.dump(data, tmp, ensure_ascii=False, indent=2)
        tmp_path = tmp.name
    os.replace(tmp_path, path)


def canonicalize_key(label_or_key: str) -> str:
    normalized = unicodedata.normalize("NFD", str(label_or_key))
    cleaned = "".join(c for c in normalized if unicodedata.category(c) != "Mn")
    tokens = re.sub(r"[^0-9a-zA-Z]+", " ", cleaned).strip().split()
    if not tokens:
        return ""
    first, *rest = [t.lower() for t in tokens]
    return first + "".join(t.capitalize() for t in rest)


def get_all_schemas() -> Dict[str, List[str]]:
    data = _load_json(FIELD_MAPS_PATH, {})
    if not isinstance(data, dict):
        return {}
    return {k: v if isinstance(v, list) else [] for k, v in data.items()}


def get_schema(view_type: str) -> List[str]:
    vt = (view_type or "").upper()
    return get_all_schemas().get(vt, [])


def detect_new_columns(columns: Sequence[str], view_type: str) -> List[str]:
    existing = set(get_schema(view_type))
    detected: List[str] = []
    for col in columns:
        key = canonicalize_key(col)
        if not key or key in existing or key in detected:
            continue
        detected.append(key)
    return detected


def log_new_columns(view_type: str, new_columns: Sequence[str], source: str) -> Dict:
    history = _load_json(FIELD_HISTORY_PATH, {})
    entries = history.get("entries") or history.get("changes") or []
    if not isinstance(entries, list):
        entries = []
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "viewType": (view_type or "").upper(),
        "newColumns": list(new_columns),
        "source": source,
    }
    entries.append(entry)
    payload = {"entries": entries}
    _save_json(FIELD_HISTORY_PATH, payload)
    return entry


def add_new_fields(view_type: str, labels: Sequence[str]) -> List[str]:
    vt = (view_type or "").upper()
    maps = get_all_schemas()
    current = list(maps.get(vt, []))
    current_set = set(current)
    added: List[str] = []
    for label in labels:
        key = canonicalize_key(label)
        if not key or key in current_set:
            continue
        current.append(key)
        current_set.add(key)
        added.append(key)
    if added or vt not in maps:
        maps[vt] = current
        _save_json(FIELD_MAPS_PATH, maps)
        if added:
            log_new_columns(vt, added, "apply-new-fields")
    return added


def update_schema(view_type: str, new_fields: List[str]) -> Dict:
    maps = get_all_schemas()
    vt = view_type.upper()
    current = maps.get(vt, [])
    updated = list(current)
    for f in new_fields:
        if f not in updated:
            updated.append(f)
    maps[vt] = updated
    _save_json(FIELD_MAPS_PATH, maps)
    log_new_columns(vt, new_fields, "update-schema")
    return maps


def rollback_schema(view_type: str) -> Dict:
    maps = get_all_schemas()
    history = _load_json(FIELD_HISTORY_PATH, {})
    entries = history.get("entries") or history.get("changes") or []
    if not isinstance(entries, list):
        entries = []
    vt = view_type.upper()
    for i in range(len(entries) - 1, -1, -1):
        if entries[i].get("viewType") == vt:
            previous = entries[i].get("previous") or []
            maps[vt] = previous if isinstance(previous, list) else []
            entries.pop(i)
            break
    history_payload = {"entries": entries}
    _save_json(FIELD_MAPS_PATH, maps)
    _save_json(FIELD_HISTORY_PATH, history_payload)
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
