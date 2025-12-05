// src/modules/Pages/Dashboard/Components/DisplayData/Export/mailGridFromModal.ts
import type { Item } from '../../../../../Types/item';

/**
 * Mapeos completos: 17 campos para VIT y 9 para VUL.
 * Excluye cualquier campo interno (id, hasLink, comments) al no estar en los mapas.
 */
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
  'VITS': 'vits',
};


function buildPlainTextTable(data: Item[], map: Record<string, keyof Item>): string {
  const headers = Object.keys(map);
  let text = headers.join('\t') + '\r\n';
  for (const item of data) {
    const row = headers.map((header) => {
      const key = map[header];
      const val = key ? item[key] : '';
      // Evitar tabs/CRLF en celdas para no romper el formato
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

  const map = isVULView ? vitColumnMap : vulColumnMap;
  const plainTextTable = buildPlainTextTable(dataToSend, map);

  const ids = dataToSend.map((item) => item.numero).join(' - ');
  const subject = isVULView ? `VITS || ${ids} ||` : `VUL || ${ids} ||`;

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
  } catch {

  }
}