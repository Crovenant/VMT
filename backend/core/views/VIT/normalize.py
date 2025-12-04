# core/views/VIT/normalize.py
import re
import pandas as pd

_HEADER_MAP = {
    "número": "numero",
    "numero": "numero",
    "no.": "numero",
    "id externo": "idExterno",
    "idexterno": "idExterno",
    "id_externo": "idExterno",
    "estado": "estado",
    "resumen": "resumen",
    "breve descripción": "breveDescripcion",
    "breve descripcion": "breveDescripcion",
    "elemento de configuración": "elementoConfiguracion",
    "elemento de configuracion": "elementoConfiguracion",
    "prioridad": "prioridad",
    "puntuación de riesgo": "puntuacionRiesgo",
    "puntuacion de riesgo": "puntuacionRiesgo",
    "grupo de asignación": "grupoAsignacion",
    "grupo de asignacion": "grupoAsignacion",
    "asignado a": "asignadoA",
    "creado": "creado",
    "actualizado": "actualizado",
    "sites": "sites",
    "vulnerability solution": "vulnerabilitySolution",
    "vulnerabilidad": "vulnerabilidad",
    "vul": "vul",
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
    "idExterno",
    "estado",
    "resumen",
    "breveDescripcion",
    "elementoConfiguracion",
    "prioridad",
    "grupoAsignacion",
    "asignadoA",
    "creado",
    "actualizado",
    "sites",
    "vulnerabilitySolution",
    "vulnerabilidad",
    "vul",
    "dueDate",
    "closedDate",
]

_CANON_KEYS_OTHER = ["closedDelayDays", "overdue", "puntuacionRiesgo"]


def _norm_header(s: object) -> str:
    t = str(s or "").strip().lower()
    t = re.sub(r"\s+", " ", t)
    t = t.replace("_", " ")
    return t


def _canon_name(col: object) -> str:
    key = _norm_header(col)
    return _HEADER_MAP.get(key, str(col).strip())


def normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.columns = [_canon_name(c) for c in out.columns]
    for col in _CANON_KEYS_STR:
        if col not in out.columns:
            out[col] = ""
    for col in _CANON_KEYS_OTHER:
        if col not in out.columns:
            out[col] = None
    if "puntuacionRiesgo" in out.columns:
        out["puntuacionRiesgo"] = pd.to_numeric(
            out["puntuacionRiesgo"], errors="coerce"
        )
    for col in _CANON_KEYS_STR:
        if col in out.columns:
            out[col] = out[col].astype(str).fillna("")
    return out
