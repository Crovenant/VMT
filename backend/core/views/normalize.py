import pandas as pd

def normalize_headers(df):
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
        "Vulnerabilidad": "vulnerabilidad"
    }
    df.rename(columns=header_mapping, inplace=True)
    if 'puntuacionRiesgo' in df.columns:
        df['puntuacionRiesgo'] = pd.to_numeric(df['puntuacionRiesgo'], errors='coerce')
    for col in ['creado', 'actualizado']:
        if col in df.columns:
            df[col] = df[col].astype(str)
    return df