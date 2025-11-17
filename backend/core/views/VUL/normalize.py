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

def _norm_severity(x: object) -> object:
    if pd.isna(x):
        return x
    key = str(x).strip().lower()
    return _SEVERITY_CANON.get(key, str(x))

def normalize_headers_vul(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    if "Prioridad" in out.columns:
        out["Prioridad"] = out["Prioridad"].map(_norm_severity)
    for col in _DATE_COLUMNS:
        if col in out.columns:
            out[col] = out[col].astype(str)
    for col in ["Número", "id", "VITS"]:
        if col in out.columns:
            out[col] = out[col].astype(str)
