# core/views/VUL/risk_logic.py
from typing import List, Dict, Tuple, Any
from collections import OrderedDict
from datetime import datetime, timedelta
import math

_HORIZON_BY_SEVERITY = {
    "critical": 30,
    "high": 90,
    "medium": 365,
    "low": 365,
}

_DATE_INPUT_CANDIDATES = [
    "%Y-%m-%d",
    "%Y/%m/%d",
    "%d/%m/%Y",
    "%d-%m-%Y",
    "%Y-%m-%d %H:%M:%S",
    "%Y/%m/%d %H:%M:%S",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%dT%H:%M:%S.%f",
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
    if not base:
        return None
    sev = str(prioridad).strip().lower() if prioridad is not None else ""
    horizon = _HORIZON_BY_SEVERITY.get(sev, 365)
    return (base + timedelta(days=horizon)).strftime("%Y-%m-%d")


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


def ensure_due_vul(entry: Dict) -> Dict:
    if not isinstance(entry, dict):
        return entry
    if not entry.get("dueDate"):
        computed = calculate_due_date_vul(
            entry.get("actualizado"), entry.get("prioridad")
        )
        if computed:
            entry["dueDate"] = computed
    return entry


def _collect_used_ids(rows: List[Dict]) -> Tuple[set, int]:
    used = set()
    for r in rows:
        try:
            used.add(str(r.get("id")))
        except Exception:
            pass
    next_id = len(used) + 1
    return used, next_id


def assign_ids_and_merge_vul(
    existing_data: List[Dict], unique_new_entries: List[Dict]
) -> List[Dict]:
    merged = list(existing_data)
    used_ids, next_id = _collect_used_ids(existing_data)
    for entry in unique_new_entries:
        entry = _sanitize_any(entry)
        entry = ensure_due_vul(entry)
        entry = _sanitize_link(entry)
        while str(next_id) in used_ids:
            next_id += 1
        od = OrderedDict()
        od["id"] = f"SOUP-{next_id:03d}"
        used_ids.add(str(next_id))
        next_id += 1
        for k, v in entry.items():
            if k != "id":
                od[k] = v
        od = _sanitize_any(od)
        od = _sanitize_link(od)
        merged.append(od)
    return merged


def update_selected_entries_vul(
    existing_data: List[Dict], selected_entries: List[Dict]
) -> List[Dict]:
    by_num = {
        str(r.get("numero", "")).strip().lower(): r
        for r in existing_data
        if r.get("numero")
    }
    used_ids, next_id = _collect_used_ids(existing_data)
    updated_rows: List[Dict] = []
    keys_to_remove = set()
    for entry in selected_entries:
        entry = _sanitize_any(entry)
        entry = ensure_due_vul(entry)
        entry = _sanitize_link(entry)
        k_num = str(entry.get("numero", "")).strip().lower()
        chosen = by_num.get(k_num)
        od = OrderedDict()
        if chosen and chosen.get("id"):
            od["id"] = chosen["id"]
            keys_to_remove.add(k_num)
        else:
            while str(next_id) in used_ids:
                next_id += 1
            od["id"] = f"SOUP-{next_id:03d}"
            used_ids.add(str(next_id))
            next_id += 1
        for field, val in entry.items():
            if field != "id":
                od[field] = val
        od = _sanitize_any(od)
        od = _sanitize_link(od)
        updated_rows.append(od)
        keys_to_remove.add(k_num)
    final_data = [
        row
        for row in existing_data
        if str(row.get("numero", "")).strip().lower() not in keys_to_remove
    ]
    final_data.extend(updated_rows)
    return final_data


def enrich_vul(vul_list: List[Dict], vit_list: List[Dict]) -> List[Dict]:
    vit_map = {
        str(v.get("numero", "")).strip().lower(): _sanitize_any(dict(v))
        for v in vit_list
    }
    for vul in vul_list:
        vul = _sanitize_any(vul)
        vul = _sanitize_link(vul)
        vits_raw = vul.get("vits", "")
        vits_numbers = [
            v.strip().lower() for v in str(vits_raw).split(",") if v.strip()
        ]
        associated_vits = []
        for vit_num in vits_numbers:
            vit_obj = vit_map.get(vit_num)
            if vit_obj:
                associated_vits.append(vit_obj)
        vul["vitsData"] = associated_vits
        vul["hasLink"] = bool(associated_vits)
    return vul_list


def enrich_vit(vit_list: List[Dict], vul_list: List[Dict]) -> List[Dict]:
    vul_map = {
        str(v.get("numero", "")).strip().lower(): _sanitize_any(dict(v))
        for v in vul_list
    }
    for vit in vit_list:
        vit = _sanitize_any(vit)
        vit = _sanitize_link(vit)
        vul_num = str(vit.get("vul", "")).strip().lower()
        if vul_num in vul_map:
            vit["vulData"] = vul_map[vul_num]
            vit["hasLink"] = True
        else:
            vit["vulData"] = None
            vit["hasLink"] = False
    return vit_list


def sanitize_duplicate_pairs(pairs: List[Dict[str, Dict]]) -> List[Dict[str, Dict]]:
    sanitized: List[Dict[str, Dict]] = []
    for p in pairs:
        existing = _sanitize_any(dict(p.get("existing", {})))
        existing = _sanitize_link(existing)
        incoming = _sanitize_any(dict(p.get("incoming", {})))
        incoming = _sanitize_link(incoming)
        sanitized.append({"existing": existing, "incoming": incoming})
    return sanitized


def sanitize_upload_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(payload, dict):
        return payload
    out: Dict[str, Any] = dict(payload)
    dups = payload.get("duplicates")
    if isinstance(dups, list):
        out["duplicates"] = sanitize_duplicate_pairs(dups)
    news = payload.get("new")
    if isinstance(news, list):
        cleaned_news: List[Dict[str, Any]] = []
        for e in news:
            e = _sanitize_any(dict(e))
            e = _sanitize_link(e)
            cleaned_news.append(e)
        out["new"] = cleaned_news
    return out
