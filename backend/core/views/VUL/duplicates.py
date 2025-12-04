# backend/core/views/VUL/duplicates.py
from typing import List, Dict, Tuple, Any
import unicodedata
import math


def _norm(s: str) -> str:
    if s is None:
        return ""
    s = str(s).strip().lower()
    s = "".join(
        c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn"
    )
    return s


def _is_nan_value(v: Any) -> bool:
    try:
        if isinstance(v, float) and math.isnan(v):
            return True
    except Exception:
        pass
    if v is None:
        return True
    try:
        sv = str(v).strip().lower()
        if sv in ("nan", "none", "null"):
            return True
    except Exception:
        pass
    return False


def _sanitize_any(entry: Dict) -> Dict:
    if not isinstance(entry, dict):
        return entry
    for k, v in list(entry.items()):
        if _is_nan_value(v):
            entry[k] = ""
        else:
            if not isinstance(v, (dict, list, bool, int, float)):
                entry[k] = str(v)
    return entry


def _sanitize_link(entry: Dict) -> Dict:
    vits_val = entry.get("vits")
    if _is_nan_value(vits_val):
        entry["vits"] = ""
    else:
        entry["vits"] = str(vits_val) if vits_val is not None else ""
    if "hasLink" not in entry:
        entry["hasLink"] = False
    return entry


def _ensure_front_fields(entry: Dict) -> Dict:
    if "dueDate" not in entry or _is_nan_value(entry.get("dueDate")):
        entry["dueDate"] = ""
    else:
        entry["dueDate"] = str(entry.get("dueDate"))
    if "closedDate" not in entry or _is_nan_value(entry.get("closedDate")):
        entry["closedDate"] = ""
    else:
        entry["closedDate"] = str(entry.get("closedDate"))
    if "closedDelayDays" not in entry or _is_nan_value(entry.get("closedDelayDays")):
        entry["closedDelayDays"] = ""
    else:
        entry["closedDelayDays"] = str(entry.get("closedDelayDays"))
    if "overdue" not in entry or entry.get("overdue") is None:
        entry["overdue"] = False
    return entry


def detect_duplicates(existing_data: List[Dict], new_entries: List[Dict]):
    by_num = {_norm(r.get("numero", "")): r for r in existing_data if r.get("numero")}

    duplicates = []
    unique_new_entries = []

    for entry in new_entries:
        entry = _sanitize_any(entry)
        entry = _sanitize_link(entry)
        entry = _ensure_front_fields(entry)

        k_num = _norm(entry.get("numero", ""))

        existing_row = by_num.get(k_num) if k_num else None

        if existing_row:
            existing_row = _sanitize_any(existing_row)
            existing_row = _sanitize_link(existing_row)
            existing_row = _ensure_front_fields(existing_row)
            duplicates.append({"existing": existing_row, "incoming": entry})
        else:
            unique_new_entries.append(entry)

    return duplicates, unique_new_entries
