
// src/modules/Shared/FieldMapping/schemaUtils.ts
export function normalizeHeader(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

function allowedDisplayHeaders(viewType: 'VIT' | 'VUL'): string[] {
  if (viewType === 'VIT') {
    return [
      'Número',
      'ID externo',
      'Estado',
      'Resumen',
      'Breve descripción',
      'Elemento de configuración',
      'Prioridad',
      'Puntuación de riesgo',
      'Grupo de asignación',
      'Asignado a',
      'Creado',
      'Actualizado',
      'Sites',
      'Vulnerability solution',
      'Vulnerabilidad',
      'VUL'
    ];
  }
  return [
    'Número',
    'Activo',
    'Elementos vulnerables',
    'Asignado a',
    'Grupo de asignación',
    'Prioridad',
    'Estado',
    'Actualizado',
    'VITS'
  ];
}

export function detectNewFields(headers: string[], viewType: 'VIT' | 'VUL'): string[] {
  const allowed = allowedDisplayHeaders(viewType).map(normalizeHeader);
  return headers.filter(h => !allowed.includes(normalizeHeader(h)));
}
