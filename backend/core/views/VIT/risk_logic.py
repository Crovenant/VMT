# backend/core/views/VIT/risk_logic.py
from typing import List, Dict, Tuple
from collections import OrderedDict
import unicodedata
from datetime import datetime, timedelta

# ---------- Normalización ----------
def _norm(s: str) -> str:
    if s is None:
        return ""
    s = str(s).strip().lower()
    s = "".join(
        c for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )
    return s

def _key(item: Dict) -> Tuple[str, str]:
    return (_norm(item.get("numero", "")), _norm(item.get("idExterno", "")))

def _collect_used_ids(rows: List[Dict]) -> Tuple[set, int]:
    used = set()
    for r in rows:
        try:
            used.add(int(r.get("id")))
        except Exception:
            pass
    next_id = (max(used) + 1) if used else 1
    return used, next_id

# ---------- Due Date ----------
_HORIZON_BY_PRIORITY = {
    "critico": 30, "crítico": 30, "critical": 30,
    "alto": 90, "alta": 90, "high": 90,
    "medio": 365, "media": 365, "medium": 365,
    "bajo": 365, "baja": 365, "low": 365,
}

def _parse_date_loose(s: str | None) -> datetime | None:
    if not s:
        return None
    s = str(s).strip()
    # Intentos comunes
    formats = [
        "%Y-%m-%d", "%Y/%m/%d",
        "%d/%m/%Y", "%d-%m-%Y",
        "%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            pass
    # Último recurso: ISO laxo
    try:
        return datetime.fromisoformat(s)
    except Exception:
        return None

def calculate_due_date(creado: str | None, prioridad: str | None) -> str | None:
    base = _parse_date_loose(creado)
    if not base:
        return None
    horizon = _HORIZON_BY_PRIORITY.get(_norm(prioridad or ""), 365)
    return (base + timedelta(days=horizon)).strftime("%Y-%m-%d")

def _ensure_due(entry: Dict) -> Dict:
    """Idempotente: rellena entry['dueDate'] si falta, usando 'creado' y 'prioridad'."""
    if isinstance(entry, dict) and not entry.get("dueDate"):
        entry["dueDate"] = calculate_due_date(entry.get("creado"), entry.get("prioridad"))
    return entry

# ---------- Merge/Update ----------
def assign_ids_and_merge(existing_data: List[Dict], unique_new_entries: List[Dict]) -> List[Dict]:
    merged = list(existing_data)
    used_ids, next_id = _collect_used_ids(existing_data)

    for entry in unique_new_entries:
        entry = _ensure_due(entry)

        while next_id in used_ids:
            next_id += 1

        od = OrderedDict()
        od["id"] = next_id
        used_ids.add(next_id)
        next_id += 1

        for k, v in entry.items():
            if k != "id":
                od[k] = v

        merged.append(od)

    return merged

def update_selected_entries(
    existing_data: List[Dict],
    selected_entries: List[Dict],
    lookup: Dict[Tuple[str, str], Dict],
) -> List[Dict]:
    by_both = {_key(r): r for r in existing_data}
    by_idext = {_norm(r.get("idExterno", "")): r for r in existing_data if r.get("idExterno")}
    by_num = {_norm(r.get("numero", "")): r for r in existing_data if r.get("numero")}

    used_ids, next_id = _collect_used_ids(existing_data)
    updated_rows: List[Dict] = []
    keys_to_remove = set()

    for entry in selected_entries:
        entry = _ensure_due(entry)

        k_both = _key(entry)
        k_id = _norm(entry.get("idExterno", ""))
        k_num = _norm(entry.get("numero", ""))

        chosen = None
        if k_both in by_both:
            chosen = by_both[k_both]
        elif k_id and k_id in by_idext:
            chosen = by_idext[k_id]
        elif k_num and k_num in by_num:
            chosen = by_num[k_num]

        od = OrderedDict()

        if chosen and chosen.get("id") is not None:
            try:
                od["id"] = int(chosen["id"])
            except Exception:
                od["id"] = chosen["id"]
            keys_to_remove.add(_key(chosen))
        else:
            while next_id in used_ids:
                next_id += 1
            od["id"] = next_id
            used_ids.add(next_id)
            next_id += 1

        for field, val in entry.items():
            if field != "id":
                od[field] = val

        updated_rows.append(od)
        keys_to_remove.add(k_both)

    final_data = [row for row in existing_data if _key(row) not in keys_to_remove]
    final_data.extend(updated_rows)
    return final_data
