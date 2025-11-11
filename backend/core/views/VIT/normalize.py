# backend/core/views/VIT/normalize.py
import pandas as pd

def normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normaliza cabeceras del Excel a las claves usadas por el backend VIT.
    Convierte 'puntuacionRiesgo' a numérico y fechas a str.
    """
    header_mapping = {
        "Número": "numero",
        "ID externo": "idExterno",
        "Estado": "estado",
        "Resumen": "resumen",
        "Breve descripción": "breveDescripcion",
        "Elemento de configuración": "elementoConfiguracion",
        "Prioridad": "prioridad",
        "Puntuación de riesgo": "puntuacionRiesgo",
        "Grupo de asignación": "grupoAsignacion",
        "Asignado a": "asignadoA",
        "Creado": "creado",
        "Actualizado": "actualizado",
        "Sites": "sites",
        "Vulnerability solution": "vulnerabilitySolution",
        "Vulnerabilidad": "vulnerabilidad",
    }

    df = df.copy()
    df.rename(columns=header_mapping, inplace=True)

    # Riesgo → numérico
    if "puntuacionRiesgo" in df.columns:
        df["puntuacionRiesgo"] = pd.to_numeric(df["puntuacionRiesgo"], errors="coerce")

    # Fechas a string (conserva formato actual)
    for col in ["creado", "actualizado"]:
        if col in df.columns:
            df[col] = df[col].astype(str)

    return df
