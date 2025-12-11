
// src/modules/Pages/Dashboard/Components/DisplayData/Export/mailGridFromModal.ts
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
  'Vulnerability solution': 'vulnerabilitySolution',
  'Vulnerabilidad': 'vulnerabilidad',
  'Due date': 'dueDate',
  'Fecha de cierre': 'closedDate',
  'Retraso de cierre (días)': 'closedDelayDays',
  'VUL': 'vul',
};

const vulColumnMap: Record<string, keyof Item> = {
  'Numero': 'numero',
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

function hasClosedData(data: Item[]): boolean {
  return Array.isArray(data) && data.some((r) => {
    const cd = r?.closedDate;
    const cdd = r?.closedDelayDays as unknown as string | number | undefined;
    const hasCD = cd !== undefined && cd !== null && String(cd).trim() !== '';
    const hasCDD = cdd !== undefined && cdd !== null && String(cdd).trim() !== '';
    return hasCD || hasCDD;
  });
}

function buildHeaders(map: Record<string, keyof Item>, data: Item[]): string[] {
  const includeClosed = hasClosedData(data);
  const headers = Object.keys(map);
  if (!includeClosed) {
    return headers.filter((h) => h !== 'Fecha de cierre' && h !== 'Retraso de cierre (días)');
  }
  return headers;
}

function buildPlainTextTable(data: Item[], map: Record<string, keyof Item>, headers: string[]): string {
  let text = headers.join('\t') + '\r\n';
  for (const item of data) {
    const row = headers.map((header) => {
      const key = map[header];
      let val: unknown = key ? item[key] : '';
      if (header === 'Fecha de cierre') val = item.closedDate ?? '';
      if (header === 'Retraso de cierre (días)') val = item.closedDelayDays ?? '';
      const s = val == null ? '' : String(val);
      return s.replace(/\r?\n/g, ' ').replace(/\t/g, ' ');
    });
    text += row.join('\t') + '\r\n';
  }
  return text;
}

export async function mailGridFromModal(
  allRows: Item[],
  selectedRows: Item[],
  isVULView: boolean
) {
  const dataToSend = selectedRows.length > 0 ? selectedRows : allRows;
  if (!dataToSend || dataToSend.length === 0) return;

  const map = isVULView ? vulColumnMap : vitColumnMap;
  const headers = buildHeaders(map, dataToSend);
  const plainTextTable = buildPlainTextTable(dataToSend, map, headers);

  const ids = dataToSend.map((item) => item.numero).join(' - ');
  const subject = isVULView ? `VUL || ${ids} ||` : `VITS || ${ids} ||`;

  const msOutlookCompose =
    `ms-outlook://compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextTable)}`;
  const mailtoCompose =
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextTable)}`;

  let opened = false;
  try {
    const w = window.open(msOutlookCompose, '_blank');
    opened = !!w;
  } catch {
    opened = false;
  }

  if (!opened) {
    try {
      window.location.href = mailtoCompose;
      opened = true;
    } catch {
      opened = false;
    }
  }

  try {
    await navigator.clipboard.writeText(plainTextTable);
  } catch {}
}
