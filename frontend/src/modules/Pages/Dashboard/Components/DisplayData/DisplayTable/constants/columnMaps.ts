import type { Item } from '../../../../../../Types/item';

/**
 * Column header → Item key, per view.
 * IMPORTANT:
 *  - No bilingual duplicates here (to avoid double options in the side panel).
 *  - Csirt uses Spanish headers only.
 *  - Cso uses English headers only.
 *  - The ES/EN normalization of values is handled in hooks (e.g., CsoToItem),
 *    not by adding duplicate headers here.
 */

/* ===========================
   Csirt (Spanish UI labels)
=========================== */
export const CSIRT_MAP: Record<string, keyof Item> = {
  // Identificación
  'Número': 'numero',
  'ID externo': 'idExterno',

  // Estado / resumen
  'Estado': 'estado',
  'Resumen': 'resumen',
  'Breve descripción': 'breveDescripcion',
  'Elemento de configuración': 'elementoConfiguracion',

  // Prioridad y riesgo
  'Prioridad': 'prioridad',
  'Puntuación de riesgo': 'puntuacionRiesgo',

  // Asignación
  'Grupo de asignación': 'grupoAsignacion',
  'Asignado a': 'asignadoA',

  // Fechas
  'Creado': 'creado',
  'Actualizado': 'actualizado',
  'Due date': 'dueDate',
  'Fecha creación': 'fechaCreacion',

  // Varios
  'Sites': 'sites',
  'Vulnerabilidad': 'vulnerabilidad',
  'Solución': 'vulnerabilitySolution',
  'Comentarios': 'comentarios',
};

/* ===========================
   Cso (English UI labels)
=========================== */
export const CSO_MAP: Record<string, keyof Item> = {
  // Identification / titles
  'Vulnerability ID': 'vulnerabilityId',
  'Vulnerability Title': 'vulnerabilityTitle',
  'ID Test': 'idTest',
  'New Code': 'newCode',

  // State / severity / codes
  // Map Severity → prioridad to reuse the same icon/highlight renderer
  'Severity': 'prioridad',
  'State': 'state',
  'State CSO': 'stateCso',
  'VUL Code': 'vulCode',
  'VIT Code': 'vitCode',

  // Configuration / application
  'Hostname': 'hostname',
  'Application': 'application',
  'Service': 'service',
  'Origin': 'origin',
  'Network': 'network',
  'Type': 'type',
  'Domain': 'domain',
  'Environment': 'environment',

  // Classifications
  'Category ASVS': 'categoryAsvs',
  'ASVS ID': 'asvsId',
  'OWASP TOP 10': 'owaspTop10',
  'PCI Status': 'pciStatus',

  // Descriptions / details
  'Threat Description': 'threatDescription',
  'Details': 'details',
  'Target': 'target',
  'Nº of Ocurrences': 'numOcurrences',

  // Dates / SLA
  'Detection Date': 'detectionDate',
  'Production Date': 'productionDate',
  'Resolution Date': 'resolutionDate',
  'Deadline': 'deadline',
  'Days Open': 'daysOpen',
  'Due date': 'dueDate',

  // Mitigations / references
  'Countermeasure': 'countermeasure',
  'References / CWE': 'referencesCwe',

  // Scoring
  'CVSS Base': 'cvssBase',
  'CVSS Overall': 'cvssOverall',
  'CVSS Rescored': 'cvssRescored',
  'CVSS Version': 'cvssVersion',
  'CVSS Vector': 'cvssVector',
  'EPSS': 'epss',
  'Easy of Exploit': 'easyOfExploit',

  // Deployment / duplicates
  'Deployed in production?': 'deployedInProduction',
  'Duplicates?': 'duplicates',

  // Ownership
  'IT Owner': 'itOwner',
  'Detection team': 'detectionTeam',
  'SW Provider': 'swProvider',

  // Business / misc
  'AP': 'ap',
  'Critical Case': 'criticalCase',
  'Observations': 'observations',
  'HU Jira': 'huJira',
  'Certificate requested': 'certificacionPedida',
  'Certificate Request Number': 'numeroPeticionCertificacion',
  'Certificate': 'certificado',
};
