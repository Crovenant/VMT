# backend/core/views/VIT/duplicates.py
from typing import List, Dict, Tuple
import unicodedata

def _norm(s: str) -> str:
    if s is None:
        return ""
    s = str(s).strip().lower()
    # Quita acentos (NFD → sin marcas diacríticas)
    s = "".join(
        c for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )
    return s

def _key(item: Dict) -> Tuple[str, str]:
    """Clave compuesta normalizada (numero, idExterno)."""
    return (_norm(item.get("numero", "")), _norm(item.get("idExterno", "")))

def build_lookup(existing_data: List[Dict]) -> Dict[Tuple[str, str], Dict]:
    """
    Índice por clave compuesta normalizada.
    Ojo: ahora se usa solo en save_selection, para update_selected_entries,
    que ya implementa la lógica OR internamente.
    """
    idx: Dict[Tuple[str, str], Dict] = {}
    for it in existing_data:
        idx[_key(it)] = it
    return idx

def detect_duplicates(existing_data: List[Dict], new_entries: List[Dict]):
    """
    Devuelve (duplicates, unique_new_entries)

    - duplicates: lista de dicts {"existing": <fila_json>, "incoming": <fila_excel>}
      cuando hay coincidencia por:
        1) (numero, idExterno) normalizados, o
        2) idExterno, o
        3) numero.

    - unique_new_entries: filas del Excel que NO tienen match por ninguno de los criterios.
    """
    # Índices como en risk_logic.update_selected_entries
    by_both = {_key(r): r for r in existing_data}
    by_idext = {
        _norm(r.get("idExterno", "")): r
        for r in existing_data if r.get("idExterno")
    }
    by_num = {
        _norm(r.get("numero", "")): r
        for r in existing_data if r.get("numero")
    }

    duplicates = []
    unique_new_entries = []

    for entry in new_entries:
        k_both = _key(entry)
        k_id = _norm(entry.get("idExterno", ""))
        k_num = _norm(entry.get("numero", ""))

        existing_row = None
        if k_both in by_both:
            existing_row = by_both[k_both]
        elif k_id and k_id in by_idext:
            existing_row = by_idext[k_id]
        elif k_num and k_num in by_num:
            existing_row = by_num[k_num]

        if existing_row:
            duplicates.append({"existing": existing_row, "incoming": entry})
        else:
            unique_new_entries.append(entry)

    return duplicates, unique_new_entries
