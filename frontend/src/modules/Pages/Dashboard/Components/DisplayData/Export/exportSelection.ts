import ExcelJS from 'exceljs';
import type { Item } from '../../../../../Types/item';

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
  'Due date': 'dueDate', // ✅ Nuevo campo
};

export async function exportSelectionToExcel(selected: Item[]) {
  if (!selected || selected.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Selected Items');

  // ✅ Cabeceras completas (igual que exportExcel)
  const headers = Object.keys(columnKeyMap);
  worksheet.addRow(headers);

  // ✅ Datos completos
  selected.forEach((item) => {
    const rowData = headers.map((header) => {
      const key = columnKeyMap[header];
      return key && key !== 'id' ? item[key] ?? '' : '';
    });
    worksheet.addRow(rowData);
  });

  // ✅ Estilo cabecera
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
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

  // ✅ Bandas alternas + bordes
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

  // ✅ Ajustar ancho automáticamente
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

  // ✅ Filtros en cabecera
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  };

  // ✅ Descargar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'selected_items_export.xlsx';
  link.click();
}