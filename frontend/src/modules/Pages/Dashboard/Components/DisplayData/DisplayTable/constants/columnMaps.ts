
// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/constants/columnMaps.ts
import type { Item } from '../../../../../../Types/item';

export const VIT_MAP: Record<string, keyof Item> = {
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
  'VUL': 'vul',
  'dueDate': 'dueDate',
  'closedDate': 'closedDate',
  'closedDelayDays': 'closedDelayDays',
};

export const VUL_MAP: Record<string, keyof Item> = {
  'Número': 'numero',
  'Activo': 'activo',
  'Elementos vulnerables': 'elementosVulnerables',
  'Asignado a': 'asignadoA',
  'Grupo de asignación': 'grupoAsignacion',
  'Prioridad': 'prioridad',
  'Estado': 'estado',
  'Actualizado': 'actualizado',
  'VITS': 'vits',
  'dueDate': 'dueDate',
  'closedDate': 'closedDate',
  'closedDelayDays': 'closedDelayDays',
}