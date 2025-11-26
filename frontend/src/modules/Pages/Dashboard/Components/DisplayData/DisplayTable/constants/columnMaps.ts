
// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/constants/columnMaps.ts
import type { Item } from '../../../../../../Types/item';

export const VIT_MAP: Record<string, keyof Item> = {
  'Número': 'numero',
  'ID externo': 'idExterno',
  'Estado': 'estado',
  'Resumen': 'resumen',
  'Breve descripción': 'breveDescripcion',
  'Elemento de configuración': 'elementoConfiguracion',
  'Dirección IP': 'direccionIp',
  'Prioridad': 'prioridad',
  'Puntuación de riesgo': 'puntuacionRiesgo',
  'Grupo de asignación': 'grupoAsignacion',
  'Asignado a': 'asignadoA',
  'Creado': 'creado',
  'Actualizado': 'actualizado',
  'Due date': 'dueDate',
  'Fecha creación': 'fechaCreacion',
  'Sites': 'sites',
  'Vulnerabilidad': 'vulnerabilidad',
  'Solución': 'vulnerabilitySolution',
  'Aplazado por': 'aplazadoPor',
  'Fecha de aplazamiento': 'fechaAplazamiento',
  'Notas de aplazamiento': 'notasAplazamiento',
  'Software vulnerable': 'softwareVulnerable',
  'Resolución': 'resolucion',
  'Comentarios': 'comentarios',
  'VUL': 'vul', 
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
  'Due date': 'dueDate',
  'VITS': 'vits',
};
