import type { WorkSheet } from 'xlsx';
import { utils } from 'xlsx';

export function formatExcelSheet(ws: WorkSheet) {
  const range = utils.decode_range(ws['!ref'] || '');
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
        fgColor: { rgb: 'FFF9C4' },
      };
      cell.s.font = {
        bold: true,
      };
    }
  }
}