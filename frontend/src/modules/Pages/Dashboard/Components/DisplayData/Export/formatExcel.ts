
// src/modules/Pages/Dashboard/Components/DisplayData/Export/formatExcel.ts
import type { Worksheet } from 'exceljs';

function colToLetter(n: number): string {
  let s = '';
  while (n > 0) {
    const mod = (n - 1) % 26;
    s = String.fromCharCode(65 + mod) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function normalizeHeader(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function formatExcelSheet(ws: Worksheet) {
  const rowCount = ws.rowCount || 0;
  const colCount = ws.columnCount || 0;
  if (rowCount === 0 || colCount === 0) return;

  const lastColLetter = colToLetter(colCount);
  ws.autoFilter = { from: 'A1', to: `${lastColLetter}1` };

  for (let c = 1; c <= colCount; c++) {
    let maxLength = 10;
    for (let r = 1; r <= rowCount; r++) {
      const cell = ws.getCell(r, c);
      const v = cell?.value;
      if (v != null && v !== '') {
        let text = '';
        if (typeof v === 'object') {
          if ((v as any).text) {
            text = String((v as any).text);
          } else if ((v as Date) instanceof Date) {
            text = (v as Date).toISOString();
          } else if ((v as any).richText) {
            text = String((v as any).richText.map((rt: any) => rt.text).join(''));
          } else {
            text = String(v);
          }
        } else {
          text = String(v);
        }
        const len = text.length;
        if (len > maxLength) maxLength = len;
      }
    }
    ws.getColumn(c).width = Math.max(10, maxLength + 2);
  }

  for (let c = 1; c <= colCount; c++) {
    const cell = ws.getCell(1, c);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00B0F0' },
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  for (let r = 2; r <= rowCount; r++) {
    const isEven = (r - 1) % 2 === 0;
    for (let c = 1; c <= colCount; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFEAF2F8' : 'FFFFFFFF' },
      };
      cell.alignment = { horizontal: 'left', vertical: 'middle' };
    }
  }

  const findClosedDelayColumnIndex = (): number | null => {
    for (let c = 1; c <= colCount; c++) {
      const headerCell = ws.getCell(1, c);
      const header = headerCell?.value != null ? String(headerCell.value) : '';
      const norm = normalizeHeader(header);

      if (
        norm === 'retraso de cierre (dias)' ||
        norm === 'retraso de cierre dias' ||
        norm === 'closeddelaydays'
      ) {
        return c;
      }
    }
    return null;
  };

  const targetCol = findClosedDelayColumnIndex();
  if (targetCol !== null) {
    for (let r = 2; r <= rowCount; r++) {
      const cell = ws.getCell(r, targetCol);
      const raw = cell?.value;
      const num =
        raw === '' || raw == null
          ? null
          : typeof raw === 'number'
          ? raw
          : Number(String(raw));

      if (num == null || Number.isNaN(num)) continue;

      if (num > 0) {
        cell.font = {
          ...(cell.font || {}),
          bold: true,
          color: { argb: 'FFCC0000' },
        };
      } else {
        cell.font = {
          ...(cell.font || {}),
          bold: false,
          color: { argb: 'FF2E7D32' },
        };
      }
    }
  }
}
