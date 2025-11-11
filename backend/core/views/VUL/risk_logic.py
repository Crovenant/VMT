# backend/core/views/VUL/risk_logic.py
from typing import List, Dict, Tuple, Any
from datetime import datetime, timedelta

from .duplicates import build_lookup, _key

# Mismas ventanas que en VIT pero mapeadas a 'Severity'
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
    # Intenta varios formatos
    for fmt in _DATE_INPUT_CANDIDATES:
        try:
            return datetime.strptime(t, fmt)
        except Exception:
            pass
    # Último recurso: ISO laxo
    try:
        return datetime.fromisoformat(t)
    except Exception:
        return None

def calculate_due_date_vul(detection_date: Any, severity: Any) -> str | None:
    base = _parse_date_loose(detection_date)
    if not base:
        return None
    sev = str(severity).strip() if severity is not None else ""
    horizon = _HORIZON_BY_SEVERITY.get(sev, 365)
    return (base + timedelta(days=horizon)).strftime("%Y-%m-%d")

def ensure_due_vul(entry: Dict) -> Dict:
    """
    Idempotente: si no hay 'Due date' (o 'Due Date'), lo calcula a partir de
    'Detection Date' + horizon por 'Severity'.
    """
    if not isinstance(entry, dict):
        return entry

    due = entry.get("Due date") or entry.get("Due Date")
    if not due:
        computed = calculate_due_date_vul(entry.get("Detection Date"), entry.get("Severity"))
        if computed:
            # preferimos 'Due date' como clave por coherencia con el dataset
            entry["Due date"] = computed
    return entry

def update_selected_entries_vul(
    existing_data: List[Dict],
    selected_entries: List[Dict],
) -> List[Dict]:
    """
    Merge por clave compuesta (Vulnerability ID, VUL Code).
    Si existe → update. Si no existe → insert. Calcula Due date si falta.
    """
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
