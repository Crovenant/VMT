
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

export async function exportGridFromModal(allRows: Item[], selectedRows: Item[], isVULView: boolean) {
  const dataToExport = selectedRows.length > 0 ? selectedRows : allRows;
  if (!dataToExport || dataToExport.length === 0) return;

  const map = isVULView ? vitColumnMap : vulColumnMap;
  const headers = Object.keys(map);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(isVULView ? 'VIT Associated' : 'VUL Associated');

  worksheet.addRow(headers);

  dataToExport.forEach((item) => {
    const rowData = headers.map((header) => {
      const key = map[header];
      return key ? item[key] ?? '' : '';
    });
    worksheet.addRow(rowData);
  });

  styleHeader(worksheet.getRow(1));
  styleRows(worksheet);
  adjustColumnWidth(worksheet);

  worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

  await downloadExcel(workbook, isVULView ? 'VIT_associated.xlsx' : 'VUL_associated.xlsx');
}
