# backend/core/views/VUL/normalize.py
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

_HEADER_MAP = {
    "Número": "numero",
    "numero": "numero",
    "Activo": "activo",
    "activo": "activo",
    "Elementos vulnerables": "elementosVulnerables",
    "elementos vulnerables": "elementosVulnerables",
    "Asignado a": "asignadoA",
    "asignado a": "asignadoA",
    "Grupo de asignación": "grupoAsignacion",
    "grupo de asignacion": "grupoAsignacion",
    "Prioridad": "prioridad",
    "prioridad": "prioridad",
    "Estado": "estado",
    "estado": "estado",
    "Actualizado": "actualizado",
    "actualizado": "actualizado",
    "VITS": "vits",
    "vits": "vits",
    "id": "id",
}


def _norm_severity(x: object) -> object:
    if pd.isna(x):
        return x
    key = str(x).strip().lower()
    return _SEVERITY_CANON.get(key, str(x))


def normalize_headers_vul(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.columns = [_HEADER_MAP.get(str(c).strip(), str(c).strip()) for c in out.columns]
    # Manage columns that may not exist in _HEADER_MAP

    if "prioridad" in out.columns:
        out["prioridad"] = out["prioridad"].map(_norm_severity)

    for col in [
        "numero",
        "id",
        "vits",
        "activo",
        "elementosVulnerables",
        "actualizado",
    ]:
        if col in out.columns:
            out[col] = out[col].astype(str)
