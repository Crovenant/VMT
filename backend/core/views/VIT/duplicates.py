# backend/core/views/VIT/duplicates.py
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
    return (_norm(item.get("numero", "")), _norm(item.get("idExterno", "")))


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
    vul_val = entry.get("VUL")
    if _is_nan_value(vul_val):
        entry["VUL"] = ""
    else:
        entry["VUL"] = str(vul_val) if vul_val is not None else ""
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
    by_idext = {
        _norm(r.get("idExterno", "")): r for r in existing_data if r.get("idExterno")
    }
    by_num = {_norm(r.get("numero", "")): r for r in existing_data if r.get("numero")}

    duplicates = []
    unique_new_entries = []

    for entry in new_entries:
        entry = _sanitize_any(entry)
        entry = _sanitize_link(entry)

        k_both = _key(entry)
        k_id = _norm(entry.get("idExterno", ""))
        k_num = _norm(entry.get("numero", ""))

        existing_row = None
        if k_both in by_both:
            existing_row = by_both[k_both]
        elif k_id and k_id in by_idext:
            existing_row = by_idext[k_id]
        elif k_num and k_num in by_num:
            existing_row = by_num[k_num]

        if existing_row:
            existing_row = _sanitize_any(existing_row)
            existing_row = _sanitize_link(existing_row)
            duplicates.append({"existing": existing_row, "incoming": entry})
        else:
            unique_new_entries.append(entry)

    return duplicates, unique_new_entries
