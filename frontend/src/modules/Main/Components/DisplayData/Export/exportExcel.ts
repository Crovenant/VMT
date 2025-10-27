import { utils, writeFileXLSX } from 'xlsx';
import type { Item } from '../../../types/item';

const columnKeyMap: Record<string, keyof Item> = {
  'Número': 'numero',
  'ID externo': 'idExterno',
  'Estado': 'estado',
  'Resumen': 'resumen',
  'Breve descripción': 'breveDescripcion',
  'Elemento de configuración': 'elementoConfiguracion',
  'Prioridad': 'prioridad',
  'Puntuación de riesgo': 'puntuacionRiesgo',
  'Grupo de asignación': 'grupoAsignacion',
  'Asignado a': 'asignadoA',
  'Creado': 'creado',
  'Actualizado': 'actualizado',
  'Sites': 'sites',
  'Vulnerability solution': 'vulnerabilitySolution',
  'Vulnerabilidad': 'vulnerabilidad',
};

export function exportFilteredDataToExcel(data: Item[], visibleColumns: string[]) {
  if (!data || data.length === 0) return;

  const filtered = data.map(({ id, followUp, soonDue, ...rest }) => {
    const item = rest as Record<string, any>;
    const out: Record<string, any> = {};
    visibleColumns.forEach(col => {
      const key = columnKeyMap[col];
      if (key && item[key] !== undefined) {
        out[col] = item[key];
      }
    });
    return out;
  });

  const ws = utils.json_to_sheet(filtered);
  const range = utils.decode_range(ws['!ref'] ?? '');
  ws['!autofilter'] = { ref: utils.encode_range(range) };

  const cols: { wch: number }[] = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxLength = 10;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = utils.encode_cell({ r: R, c: C });
      const cell = ws[cellAddress];
      if (cell && cell.v) {
        const len = String(cell.v).length;
        if (len > maxLength) maxLength = len;
      }
    }
    cols.push({ wch: maxLength + 2 });
  }
  ws['!cols'] = cols;

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = utils.encode_cell({ r: range.s.r, c: C });
    const cell = ws[cellAddress];
    if (cell && !cell.s) cell.s = {};
    if (cell?.s) {
      cell.s.fill = {
        fgColor: { rgb: '4472C4' },
      };
      cell.s.font = {
        bold: true,
        color: { rgb: 'FFFFFF' },
      };
    }
  }

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Vulnerability list');
  writeFileXLSX(wb, 'vulnerability_list_export.xlsx');
}