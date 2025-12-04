# core/views/VUL/normalize.py
import re
import pandas as pd

_HEADER_MAP = {
    "número": "numero",
    "numero": "numero",
    "no.": "numero",
    "id": "id",
    "id externo": "numero",
    "idexterno": "numero",
    "id_externo": "numero",
    "activo": "activo",
    "elementos vulnerables": "elementosVulnerables",
    "elementos_vulnerables": "elementosVulnerables",
    "asignado a": "asignadoA",
    "grupo de asignación": "grupoAsignacion",
    "grupo de asignacion": "grupoAsignacion",
    "prioridad": "prioridad",
    "estado": "estado",
    "actualizado": "actualizado",
    "vits": "vits",
    "due date": "dueDate",
    "vencimiento": "dueDate",
    "dueDate": "dueDate",
    "closed date": "closedDate",
    "closedDate": "closedDate",
    "closed delay days": "closedDelayDays",
    "closedDelayDays": "closedDelayDays",
    "overdue": "overdue",
}

_CANON_KEYS_STR = [
    "numero",
    "id",
    "activo",
    "elementosVulnerables",
    "asignadoA",
    "grupoAsignacion",
    "prioridad",
    "estado",
    "actualizado",
    "vits",
    "dueDate",
    "closedDate",
]

_CANON_KEYS_OTHER = ["closedDelayDays", "overdue"]


def _norm_header(s: object) -> str:
    t = str(s or "").strip().lower()
    t = re.sub(r"\s+", " ", t)
    t = t.replace("_", " ")
    return t


def _canon_name(col: object) -> str:
    key = _norm_header(col)
    return _HEADER_MAP.get(key, str(col).strip())


def normalize_headers_vul(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.columns = [_canon_name(c) for c in out.columns]
    for col in _CANON_KEYS_STR:
        if col not in out.columns:
            out[col] = ""
    for col in _CANON_KEYS_OTHER:
        if col not in out.columns:
            out[col] = None
    for col in _CANON_KEYS_STR:
        if col in out.columns:
            out[col] = out[col].astype(str).fillna("")
    return out
