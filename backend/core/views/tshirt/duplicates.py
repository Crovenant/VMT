# backend/core/views/tshirt/duplicates.py
from typing import List, Dict, Tuple
import unicodedata

def _norm(s: str) -> str:
    if s is None:
        return ""
    s = str(s).strip().lower()
    # Quita acentos (NFD → sin marcas diacríticas)
    s = "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")
    return s

def _key(item: Dict) -> Tuple[str, str]:
    """Clave compuesta normalizada (numero, idExterno)."""
    return (_norm(item.get("numero", "")), _norm(item.get("idExterno", "")))

def build_lookup(existing_data: List[Dict]) -> Dict[Tuple[str, str], Dict]:
    """Índice rápido por clave compuesta normalizada."""
    idx: Dict[Tuple[str, str], Dict] = {}
    for it in existing_data:
        idx[_key(it)] = it
    return idx

def detect_duplicates(existing_data: List[Dict], new_entries: List[Dict]):
    """
    Devuelve (duplicates, unique_new_entries)

    - duplicates: lista de dicts {"existing": <fila_json>, "incoming": <fila_excel>}
      cuando hay coincidencia exacta por (numero, idExterno) normalizados.

    - unique_new_entries: filas del Excel que NO tienen match por la clave compuesta.
    """
    lookup = build_lookup(existing_data)
    duplicates = []
    unique_new_entries = []

    for entry in new_entries:
        k = _key(entry)
        if k in lookup:
            duplicates.append({"existing": lookup[k], "incoming": entry})
        else:
            unique_new_entries.append(entry)

    return duplicates, unique_new_entries
