export type Item = {
  id: string;
  nombre: string;
  numero: string;
  idExterno: string;
  estado: string;
  resumen: string;
  breveDescripcion: string;
  elementoConfiguracion: string;

  direccionIp?: string;
  aplazadoPor?: string;
  fechaAplazamiento?: string;
  notasAplazamiento?: string;
  softwareVulnerable?: string;
  resolucion?: string;

  fechaCreacion: string;
  prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  puntuacionRiesgo: number;
  grupoAsignacion: string;
  asignadoA: string;
  creado: string;
  actualizado: string;
  sites: string;
  vulnerabilidad: string;
  vulnerabilitySolution: string;
  dueDate: string;

  // Campos VUL adaptados
  activo?: string;
  elementosVulnerables?: string;
  vits?: string;

  // NUEVO CAMPO para lógica migrada desde frontend
  hasLink?: boolean;

  // NUEVO CAMPO para VIT → VUL relación
  vul?: string;

  // Mantener opcionales previos para compatibilidad
  tratada?: string;
  accionNotas?: string;
  actualizacionEstado?: string;
  subidaProduccion?: string;
  nombreAplicacion?: string;
  application?: string;
  vulnerabilityId?: string;
  hostname?: string;
  ab?: string;
  itDevelopmentArea?: string;
  coe?: string;
  state?: string;
  stateCso?: string;
  service?: string;
  origin?: string;
  network?: string;
  type?: string;
  vulnerabilityTitle?: string;
  severity?: string;
  domain?: string;
  categoryAsvs?: string;
  asvsId?: string;
  owaspTop10?: string;
  pciStatus?: string;
  threatDescription?: string;
  details?: string;
  target?: string;
  numOcurrences?: string;
  detectionDate?: string;
  newCode?: string;
  productionDate?: string;
  deadline?: string;
  daysOpen?: string;
  countermeasure?: string;
  environment?: string;
  referencesCwe?: string;
  cvssBase?: string;
  cvssOverall?: string;
  cvssRescored?: string;
  epss?: string;
  easyOfExploit?: string;
  cvssVersion?: string;
  cvssVector?: string;
  resolutionDate?: string;
  idTest?: string;
  deployedInProduction?: string;
  duplicates?: string;
  detectionTeam?: string;
  observations?: string;
  itOwner?: string;
  swProvider?: string;
  vulCode?: string;
  vitCode?: string;
  ap?: string;
  criticalCase?: string;
  fechaComunicacionSwf?: string;
  huJira?: string;
  certificacionPedida?: string;
  numeroPeticionCertificacion?: string;
  certificado?: string;
  fechaMitigacion?: string;
  fechaCertificacion?: string;

  comments?: string[];
  comentarios?: string;
  logHistory?: string;
  followUp?: boolean;
  soonDue?: boolean;
};

export interface Entry {
  [key: string]: string | number | boolean | null;
}

export interface DuplicatePair {
  existing: Entry;
  incoming: Entry;
}