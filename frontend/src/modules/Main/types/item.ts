// src/modules/Main/types/item.ts

export type Item = {
  id: string;
  nombre: string;
  numero: string;
  idExterno: string;
  estado: string;
  resumen: string;
  breveDescripcion: string;
  elementoConfiguracion: string;
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

  // ➕ Opcionales (los usa la tabla si existen)
   // --- opcionales, para el detalle/accordion ---
  comentarios?: string;
  logHistory?: string;


  followUp?: boolean;
  soonDue?: boolean;
};

export interface Entry {
  [key: string]: any;
}

export interface DuplicatePair {
  existing: Entry;
  incoming: Entry;
}
