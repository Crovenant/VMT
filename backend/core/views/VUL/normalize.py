# core/views/VUL/normalize.py
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

_DATE_COLUMNS = ["Actualizado"]

_HEADER_MAP = {
    "numero": "Número",
    "activo": "Activo",
    "elementos vulnerables": "Elementos vulnerables",
    "asignado a": "Asignado a",
    "grupo de asignación": "Grupo de asignación",
    "prioridad": "Prioridad",
    "estado": "Estado",
    "actualizado": "Actualizado",
    "vits": "VITS",
    "id": "id",
}


def _norm_severity(x: object) -> object:
    if pd.isna(x):
        return x
    key = str(x).strip().lower()
    return _SEVERITY_CANON.get(key, str(x))


def normalize_headers_vul(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()

    # Normalizar cabeceras
    out.columns = [
        _HEADER_MAP.get(str(c).strip().lower(), str(c).strip()) for c in out.columns
    ]

    # Normalizar severidad en Prioridad
    if "Prioridad" in out.columns:
        out["Prioridad"] = out["Prioridad"].map(_norm_severity)

    # Convertir fechas a string
    for col in _DATE_COLUMNS:
        if col in out.columns:
            out[col] = out[col].astype(str)

    # Convertir claves importantes a string
    for col in ["Número", "id", "VITS", "Activo", "Elementos vulnerables"]:
        if col in out.columns:
            out[col] = out[col].astype(str)

    return out
