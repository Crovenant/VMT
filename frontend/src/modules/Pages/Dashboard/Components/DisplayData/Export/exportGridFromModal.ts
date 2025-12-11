
// src/modules/Pages/Dashboard/Components/DisplayData/Export/exportGridFromModal.ts
import ExcelJS from 'exceljs';
import type { Item } from '../../../../../Types/item';

const vitColumnMap: Record<string, keyof Item> = {
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
  'Solución': 'vulnerabilitySolution',
  'Vulnerabilidad': 'vulnerabilidad',
  'Due date': 'dueDate',
  'Fecha de cierre': 'closedDate',
  'Retraso de cierre (días)': 'closedDelayDays',
  'VUL': 'vul',
};

const vulColumnMap: Record<string, keyof Item> = {
  'Número': 'numero',
  'Activo': 'activo',
  'Elementos vulnerables': 'elementosVulnerables',
  'Asignado a': 'asignadoA',
  'Grupo de asignación': 'grupoAsignacion',
  'Prioridad': 'prioridad',
  'Estado': 'estado',
  'Actualizado': 'actualizado',
  'Due date': 'dueDate',
  'Fecha de cierre': 'closedDate',
  'Retraso de cierre (días)': 'closedDelayDays',
  'VITS': 'vits',
};

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });
}

function styleRows(worksheet: ExcelJS.Worksheet) {
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const isEven = rowNumber % 2 === 0;
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'EAF2F8' : 'FFFFFF' } };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    }
  });
}

function adjustColumnWidth(worksheet: ExcelJS.Worksheet) {
  (worksheet.columns || []).forEach((col) => {
    if (col && typeof col.eachCell === 'function') {
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLength) maxLength = len;
      });
      col.width = maxLength + 2;
    }
  });
}

async function downloadExcel(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
}

function hasClosedData(data: Item[]): boolean {
  return Array.isArray(data) && data.some((r) => {
    const cd = r?.closedDate;
    const cdd = r?.closedDelayDays as unknown as string | number | undefined;
    const hasCD = cd !== undefined && cd !== null && String(cd).trim() !== '';
    const hasCDD = cdd !== undefined && cdd !== null && String(cdd).trim() !== '';
    return hasCD || hasCDD;
  });
}

function buildHeaders(baseMap: Record<string, keyof Item>, data: Item[]): string[] {
  const includeClosed = hasClosedData(data);
  const headers = Object.keys(baseMap);
  if (!includeClosed) {
    return headers.filter((h) => h !== 'Fecha de cierre' && h !== 'Retraso de cierre (días)');
  }
  return headers;
}

function rowsFrom(data: Item[], headers: string[], map: Record<string, keyof Item>): (string | number | boolean)[][] {
  return data.map((item) => {
    return headers.map((header) => {
      const key = map[header];
      if (!key) return '';
      let v = item[key] as unknown;
      if (header === 'Fecha de cierre') v = item.closedDate ?? '';
      if (header === 'Retraso de cierre (días)') v = (item.closedDelayDays ?? '') as unknown;
      if (v === undefined || v === null) return '';
      return v as string | number | boolean;
    });
  });
}

export async function exportGridFromModal(allRows: Item[], selectedRows: Item[], isVULView: boolean) {
  const dataToExport = selectedRows.length > 0 ? selectedRows : allRows;
  if (!dataToExport || dataToExport.length === 0) return;

  const map = isVULView ? vulColumnMap : vitColumnMap;
  const headers = buildHeaders(map, dataToExport);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(isVULView ? 'VUL Associated' : 'VIT Associated');

  worksheet.addRow(headers);

  const rows = rowsFrom(dataToExport, headers, map);
  rows.forEach((r) => worksheet.addRow(r));

  styleHeader(worksheet.getRow(1));
  styleRows(worksheet);
  adjustColumnWidth(worksheet);

  worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

  await downloadExcel(workbook, isVULView ? 'VUL_associated.xlsx' : 'VIT_associated.xlsx');
}
