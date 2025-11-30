# backend/core/views/VIT/normalize.py
import pandas as pd


def normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    header_mapping = {
        "Número": "numero",
        "numero": "numero",
        "ID externo": "idExterno",
        "id externo": "idExterno",
        "Estado": "estado",
        "estado": "estado",
        "Resumen": "resumen",
        "resumen": "resumen",
        "Breve descripción": "breveDescripcion",
        "breve descripcion": "breveDescripcion",
        "Elemento de configuración": "elementoConfiguracion",
        "elemento de configuracion": "elementoConfiguracion",
        "Prioridad": "prioridad",
        "prioridad": "prioridad",
        "Puntuación de riesgo": "puntuacionRiesgo",
        "puntuacion de riesgo": "puntuacionRiesgo",
        "Grupo de asignación": "grupoAsignacion",
        "grupo de asignacion": "grupoAsignacion",
        "Asignado a": "asignadoA",
        "asignado a": "asignadoA",
        "Creado": "creado",
        "creado": "creado",
        "Actualizado": "actualizado",
        "actualizado": "actualizado",
        "Sites": "sites",
        "sites": "sites",
        "Vulnerability solution": "vulnerabilitySolution",
        "vulnerability solution": "vulnerabilitySolution",
        "Vulnerabilidad": "vulnerabilidad",
        "vulnerabilidad": "vulnerabilidad",
        "VITS": "vits",
        "vits": "vits",
        "Activo": "activo",
        "activo": "activo",
        "VUL": "vul",
        "vul": "vul",
    }

    df = df.copy()
    df.columns = [
        header_mapping.get(str(c).strip(), str(c).strip()) for c in df.columns
    ]

    if "puntuacionRiesgo" in df.columns:
        df["puntuacionRiesgo"] = pd.to_numeric(df["puntuacionRiesgo"], errors="coerce")

    for col in ["creado", "actualizado", "vul", "vits"]:
        if col in df.columns:
            df[col] = df[col].astype(str)

    return df
