# backend/core/views/VUL/normalize.py
import re
import pandas as pd

_SEVERITY_CANON = {
    "critical": "Critical",
    "critico": "Critical",
    "crítico": "Critical",
    "high": "High",
    "alto": "High",
    "medium": "Medium",
    "medio": "Medium",
    "low": "Low",
    "bajo": "Low",
}

# Mapeo de variantes de cabecera -> clave canónica (igual VIT/VUL)
_HEADER_MAP = {
    # numero
    "número": "numero",
    "numero": "numero",
    "no.": "numero",
    "id externo": "numero",
    "idexterno": "numero",
    "id_externo": "numero",

    # activo
    "activo": "activo",
    "asset": "activo",
    "ci": "activo",

    # elementos vulnerables
    "elementos vulnerables": "elementosVulnerables",
    "elementos_vulnerables": "elementosVulnerables",
    "vulnerable items": "elementosVulnerables",

    # asignado a
    "asignado a": "asignadoA",
    "assigned to": "asignadoA",

    # grupo asignacion
    "grupo de asignación": "grupoAsignacion",
    "grupo de asignacion": "grupoAsignacion",
    "assignment group": "grupoAsignacion",

    # prioridad
    "prioridad": "prioridad",
    "priority": "prioridad",

    # estado
    "estado": "estado",
    "state": "estado",
    "status": "estado",

    # actualizado
    "actualizado": "actualizado",
    "updated": "actualizado",
    "last updated": "actualizado",

    # vits
    "vits": "vits",
    "v.i.t.s": "vits",
    "link vit": "vits",

    # due date
    "due date": "dueDate",
    "vencimiento": "dueDate",

    # id
    "id": "id",
}

_CANON_KEYS = [
    "numero",
    "activo",
    "elementosVulnerables",
    "asignadoA",
    "grupoAsignacion",
    "prioridad",
    "estado",
    "actualizado",
    "vits",
    "dueDate",
    "id",
]

def _norm_header(s: object) -> str:
    t = str(s or "").strip().lower()
    t = re.sub(r"\s+", " ", t)
    t = t.replace("_", " ")
    return t

def _canon_name(col: object) -> str:
    key = _norm_header(col)
    return _HEADER_MAP.get(key, str(col).strip())

def _norm_severity(x: object) -> object:
    if pd.isna(x):
        return ""
    k = str(x).strip().lower()
    return _SEVERITY_CANON.get(k, str(x))

def normalize_headers_vul(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.columns = [_canon_name(c) for c in out.columns]

    for col in _CANON_KEYS:
        if col not in out.columns:
            out[col] = ""

    if "prioridad" in out.columns:
        out["prioridad"] = out["prioridad"].map(_norm_severity)

    for col in [
        "numero",
        "id",
        "vits",
        "activo",
        "elementosVulnerables",
        "actualizado",
        "estado",
        "prioridad",
        "asignadoA",
        "grupoAsignacion",
        "dueDate",
    ]:
        if col in out.columns:
            out[col] = out[col].astype(str).fillna("")

    return out
