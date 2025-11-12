export type ViewType = 'VIT' | 'VUL';

export type ViewSchema = {
  listUrl: string;          // GET (cargar tabla)
  uploadUrl: string;        // POST (subir excel)
  saveUrl: string;          // POST (resolver duplicados)
  visibleColumns: string[];
  columnKeyMap: Record<string, string>;
};

export const VIEW_SCHEMAS: Record<ViewType, ViewSchema> = {
  VIT: {
    listUrl: 'http://localhost:8000/vit/risk-data/',
    uploadUrl: 'http://localhost:8000/vit/upload/',
    saveUrl: 'http://localhost:8000/vit/save-selection/',
    visibleColumns: [
      'Número',
      'Estado',
      'Breve descripción',
      'Elemento de configuración',
      'Prioridad',
      'Asignado a',
      'Creado',
      'Due date',
    ],
    columnKeyMap: {
      'Número': 'numero',
      'Estado': 'estado',
      'Breve descripción': 'breveDescripcion',
      'Elemento de configuración': 'elementoConfiguracion',
      'Prioridad': 'prioridad',
      'Asignado a': 'asignadoA',
      'Creado': 'creado',
      'Due date': 'dueDate',
    },
  },

  VUL: {
    listUrl: 'http://localhost:8000/vul/risk-data/',
    uploadUrl: 'http://localhost:8000/vul/upload/',
    saveUrl: 'http://localhost:8000/vul/save-selection/',
    visibleColumns: [
      'Vulnerability ID',
      'State',
      'Severity',
      'VUL Code',
      'VIT Code',
    ],
    columnKeyMap: {
      'Vulnerability ID': 'vulnerabilityId',
      'State': 'state',
      'Severity': 'prioridad', // reutilizamos renderer de prioridad
      'VUL Code': 'vulCode',
      'VIT Code': 'vitCode',
    },
  },
};
