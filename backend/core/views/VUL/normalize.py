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

_DATE_COLUMNS = [
    "Detection Date",
    "Resolution Date",
    "Production Date",
    "Due date",
    "Due Date",
    "Actualizacion estado",
    "Fecha mitigacion",
    "Fecha comunicación SWF",
]

def _norm_severity(x: object) -> object:
    if pd.isna(x):
        return x
    key = str(x).strip().lower()
    return _SEVERITY_CANON.get(key, str(x))

def normalize_headers_vul(df: pd.DataFrame) -> pd.DataFrame:
    """
    VUL trabaja con cabeceras originales (en inglés). Aquí solo:
    - Normalizamos 'Severity' a {Critical, High, Medium, Low} cuando sea posible.
    - Convertimos columnas de fecha a str (para JSON).
    - Aseguramos tipos string en códigos ID relevantes.
    """
    out = df.copy()

    # Severity normalizada (si existe)
    if "Severity" in out.columns:
        out["Severity"] = out["Severity"].map(_norm_severity)

    # Fechas como string (sin forzar formato; dejamos el del Excel convertido)
    for col in _DATE_COLUMNS:
        if col in out.columns:
            out[col] = out[col].astype(str)

    # Códigos a string
    for col in ["Vulnerability ID", "VUL Code", "VIT Code", "State"]:
        if col in out.columns:
            out[col] = out[col].astype(str)

    return out
