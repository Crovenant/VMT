
// src/modules/Pages/Dashboard/Components/DisplayData/Export/formatExcel.ts
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
      if (cell && cell.v != null) {
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
    if (cell) {
      cell.s = {
        fill: { fgColor: { rgb: '00B0F0' } },
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }
  }

  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const isEven = (R - range.s.r) % 2 === 0;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = utils.encode_cell({ r: R, c: C });
      const cell = ws[cellAddress];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: isEven ? 'EAF2F8' : 'FFFFFF' } },
          alignment: { horizontal: 'left', vertical: 'center' },
        };
      }
    }
  }

  const findClosedDelayColumnIndex = (): number | null => {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerAddr = utils.encode_cell({ r: range.s.r, c: C });
      const headerCell = ws[headerAddr];
      const header = headerCell ? String(headerCell.v ?? '').trim() : '';
      const norm = header
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

      if (
        norm === 'retraso de cierre (dias)' ||
        norm === 'retraso de cierre dias' ||
        norm === 'closeddelaydays'
      ) {
        return C;
      }
    }
    return null;
  };

  const targetCol = findClosedDelayColumnIndex();
  if (targetCol !== null) {
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const addr = utils.encode_cell({ r: R, c: targetCol });
      const cell = ws[addr];
      if (!cell) continue;

 
      const raw = cell.v;
      const num = raw === '' || raw == null ? null : Number(raw);
      if (num == null || Number.isNaN(num)) continue;

      if (num > 0) {

        cell.s = {
          ...(cell.s || {}),
          font: { ...(cell.s?.font || {}), bold: true, color: { rgb: 'CC0000' } },
        };
      } else {

        cell.s = {
          ...(cell.s || {}),
          font: { ...(cell.s?.font || {}), bold: false, color: { rgb: '2E7D32' } },
        };
      }
    }
  }
}
