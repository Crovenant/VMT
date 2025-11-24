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


def _key(item: Dict) -> Tuple[str, str]:

    return (_norm(item.get("Número", "")), _norm(item.get("Activo", "")))


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
    vits_val = entry.get("VITS")
    if _is_nan_value(vits_val):
        entry["VITS"] = ""
    else:
        entry["VITS"] = str(vits_val) if vits_val is not None else ""
    if "hasLink" not in entry:
        entry["hasLink"] = False
    return entry


def build_lookup(existing_data: List[Dict]) -> Dict[Tuple[str, str], Dict]:
    idx: Dict[Tuple[str, str], Dict] = {}
    for it in existing_data:
        idx[_key(it)] = it
    return idx


def detect_duplicates(existing_data: List[Dict], new_entries: List[Dict]):
    by_both = {_key(r): r for r in existing_data}
    by_num = {_norm(r.get("Número", "")): r for r in existing_data if r.get("Número")}
    by_act = {_norm(r.get("Activo", "")): r for r in existing_data if r.get("Activo")}

    duplicates = []
    unique_new_entries = []

    for entry in new_entries:
        entry = _sanitize_any(entry)
        entry = _sanitize_link(entry)

        k_both = _key(entry)
        k_num = _norm(entry.get("Número", ""))
        k_act = _norm(entry.get("Activo", ""))

        existing_row = None
        if k_both in by_both:
            existing_row = by_both[k_both]
        elif k_num and k_num in by_num:
            existing_row = by_num[k_num]
        elif k_act and k_act in by_act:
            existing_row = by_act[k_act]

        if existing_row:
            existing_row = _sanitize_any(existing_row)
            existing_row = _sanitize_link(existing_row)
            duplicates.append({"existing": existing_row, "incoming": entry})
        else:
            unique_new_entries.append(entry)

    return duplicates, unique_new_entries
