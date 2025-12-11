
// src/modules/Shared/FieldMapping/schemaUtils.ts
export function normalizeHeader(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

function allowedDisplayHeaders(viewType: 'VIT' | 'VUL'): string[] {
  if (viewType === 'VIT') {
    return [
      'numero',
      'idExterno',
      'estado',
      'resumen',
      'breveDescripcion',
      'elementoConfiguracion',
      'prioridad',
      'puntuacionRiesgo',
      'grupoAsignacion',
      'asignadoA',
      'creado',
      'actualizado',
      'sites',
      'vulnerabilitySolution',
      'vulnerabilidad',
      'vul',
      'dueDate',
      'closedDate',
      'closedDelayDays',
      'id externo',
      'breve descripcion',
      'elemento de configuracion',
      'puntuacion de riesgo',
      'grupo de asignacion',
      'asignado a',
      'solucion',
      'due date',
      'fecha de cierre',
      'retraso de cierre (dias)',
      'retraso de cierre dias'
    ];
  }
  return [
    'numero',
    'activo',
    'elementosVulnerables',
    'asignadoA',
    'grupoAsignacion',
    'prioridad',
    'estado',
    'actualizado',
    'vits',
    'dueDate',
    'closedDate',
    'closedDelayDays',
    'elementos vulnerables',
    'asignado a',
    'grupo de asignacion',
    'due date',
    'fecha de cierre',
    'retraso de cierre (dias)',
    'retraso de cierre dias'
  ];
}

export function detectNewFields(headers: string[], viewType: 'VIT' | 'VUL'): string[] {
  const allowed = allowedDisplayHeaders(viewType).map(normalizeHeader);
  return headers.filter(h => !allowed.includes(normalizeHeader(h)));
}
