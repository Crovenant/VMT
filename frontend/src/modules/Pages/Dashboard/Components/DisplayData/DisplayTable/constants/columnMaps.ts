// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/constants/columnMaps.ts
import type { Item } from '../../../../../../Types/item';

/* ========== VIT (Spanish UI labels) ========== */
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
  'Due date': 'dueDate',
  'Fecha creación': 'fechaCreacion',

  'Sites': 'sites',
  'Vulnerabilidad': 'vulnerabilidad',
  'Solución': 'vulnerabilitySolution',
  'Comentarios': 'comentarios',
};

/* ========== VUL (English UI labels) ========== */
export const VUL_MAP: Record<string, keyof Item> = {
  'Vulnerability ID': 'vulnerabilityId',
  'Vulnerability Title': 'vulnerabilityTitle',
  'ID Test': 'idTest',
  'New Code': 'newCode',

  // Severity feeds Item.prioridad to reuse the same renderers
  'Severity': 'prioridad',
  'State': 'state',
  'State CSO': 'stateCso',
  'VUL Code': 'vulCode',
  'VIT Code': 'vitCode',

  'Hostname': 'hostname',
  'Application': 'application',
  'Service': 'service',
  'Origin': 'origin',
  'Network': 'network',
  'Type': 'type',
  'Domain': 'domain',
  'Environment': 'environment',

  'Category ASVS': 'categoryAsvs',
  'ASVS ID': 'asvsId',
  'OWASP TOP 10': 'owaspTop10',
  'PCI Status': 'pciStatus',

  'Threat Description': 'threatDescription',
  'Details': 'details',
  'Target': 'target',
  'Nº of Ocurrences': 'numOcurrences',

  'Detection Date': 'detectionDate',
  'Production Date': 'productionDate',
  'Resolution Date': 'resolutionDate',
  'Deadline': 'deadline',
  'Days Open': 'daysOpen',
  'Due date': 'dueDate',

  'Countermeasure': 'countermeasure',
  'References / CWE': 'referencesCwe',

  'CVSS Base': 'cvssBase',
  'CVSS Overall': 'cvssOverall',
  'CVSS Rescored': 'cvssRescored',
  'CVSS Version': 'cvssVersion',
  'CVSS Vector': 'cvssVector',
  'EPSS': 'epss',
  'Easy of Exploit': 'easyOfExploit',

  'Deployed in production?': 'deployedInProduction',
  'Duplicates?': 'duplicates',

  'IT Owner': 'itOwner',
  'Detection team': 'detectionTeam',
  'SW Provider': 'swProvider',

  'AP': 'ap',
  'Critical Case': 'criticalCase',
  'Observations': 'observations',
  'HU Jira': 'huJira',
  'Certificate requested': 'certificacionPedida',
  'Certificate Request Number': 'numeroPeticionCertificacion',
  'Certificate': 'certificado',
};
