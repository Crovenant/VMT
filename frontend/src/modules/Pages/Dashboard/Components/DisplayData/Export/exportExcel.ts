// src/modules/Pages/Dashboard/Components/DisplayData/Export/exportExcel.ts
import ExcelJS from 'exceljs';
import type { Item } from '../../../../../Types/item';

const columnKeyMap: Record<string, keyof Item> = {
  // VIT
  'Número': 'numero',
  'ID externo': 'idExterno',
  'Estado': 'estado',
  'Resumen': 'resumen',
  'Breve descripción': 'breveDescripcion',
  'Elemento de configuración': 'elementoConfiguracion',
  'Dirección IP': 'direccionIp',
  'Aplazado por': 'aplazadoPor',
  'Fecha de aplazamiento': 'fechaAplazamiento',
  'Notas de aplazamiento': 'notasAplazamiento',
  'Software vulnerable': 'softwareVulnerable',
  'Resolución': 'resolucion',
  'Prioridad': 'prioridad',
  'Puntuación de riesgo': 'puntuacionRiesgo',
  'Grupo de asignación': 'grupoAsignacion',
  'Asignado a': 'asignadoA',
  'Creado': 'creado',
  'Actualizado': 'actualizado',
  'Sites': 'sites',
  'Vulnerability solution': 'vulnerabilitySolution',
  'Vulnerabilidad': 'vulnerabilidad',
  'Due date': 'dueDate',

  // VUL
  'id': 'id',
  'Activo': 'activo',
  'Elementos vulnerables': 'elementosVulnerables',
  'VITS': 'vits',
};

export async function exportFullJsonToExcel(data: Item[]) {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Vulnerability list');

  const headers = Object.keys(columnKeyMap);
  worksheet.addRow(headers);

  data.forEach((item) => {
    const rowData = headers.map((header) => {
      const key = columnKeyMap[header];
      return key ? (item[key] ?? '') : '';
    });
    worksheet.addRow(rowData);
  });

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '00B0F0' },
    };
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const isEven = rowNumber % 2 === 0;
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'EAF2F8' : 'FFFFFF' },
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  });

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

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vulnerability_list_export.xlsx';
  link.click();
}