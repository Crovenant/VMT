from typing import List, Dict, Tuple, Any
from datetime import datetime, timedelta
from .duplicates import build_lookup, _key

_HORIZON_BY_SEVERITY = {
    "Critical": 30,
    "High": 90,
    "Medium": 365,
    "Low": 365,
}

_DATE_INPUT_CANDIDATES = [
    "%Y-%m-%d", "%Y/%m/%d",
    "%d/%m/%Y", "%d-%m-%Y",
    "%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S",
    "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f",
]

def _parse_date_loose(s: Any) -> datetime | None:
    if s is None:
        return None
    t = str(s).strip()
    if not t or t.lower() in ("nan", "nat", "none", "null"):
        return None
    for fmt in _DATE_INPUT_CANDIDATES:
        try:
            return datetime.strptime(t, fmt)
        except Exception:
            pass
    try:
        return datetime.fromisoformat(t)
    except Exception:
        return None

def calculate_due_date_vul(actualizado: Any, prioridad: Any) -> str | None:
    base = _parse_date_loose(actualizado)
   
    sev = str(prioridad).strip() if prioridad is not None else ""
    horizon = _HORIZON_BY_SEVERITY.get(sev, 365)
    return (base + timedelta(days=horizon)).strftime("%Y-%m-%d")

def ensure_due_vul(entry: Dict) -> Dict:
    if not isinstance(entry, dict):
        return entry
    due = entry.get("Due date") or entry.get("Due Date")
    if not due:
        computed = calculate_due_date_vul(entry.get("Actualizado"), entry.get("Prioridad"))
        if computed:
            entry["Due date"] = computed
    return entry

def update_selected_entries_vul(existing_data: List[Dict], selected_entries: List[Dict]) -> List[Dict]:
    lookup = build_lookup(existing_data)
    index_by_key: Dict[Tuple[str, str], int] = {_key(r): i for i, r in enumerate(existing_data)}
    out = list(existing_data)
    for entry in selected_entries:
        entry = ensure_due_vul(entry)
        k = _key(entry)
        if k in index_by_key:
            out[index_by_key[k]] = entry
        else:
            index_by_key[k] = len(out)
            out.append(entry)
    return out