export type ViewType = 'Tshirt' | 'Soup';

export type ViewSchema = {
  listUrl: string;          // GET (cargar tabla)
  uploadUrl: string;        // POST (subir excel)
  saveUrl: string;          // POST (resolver duplicados)
  visibleColumns: string[];
  columnKeyMap: Record<string, string>;
};

export const VIEW_SCHEMAS: Record<ViewType, ViewSchema> = {
  Tshirt: {
    listUrl: 'http://localhost:8000/risk-data/',
    uploadUrl: 'http://localhost:8000/upload_data/',
    saveUrl: 'http://localhost:8000/save_selection/',
    visibleColumns: [
      'Número','Estado','Resumen','Prioridad','Puntuación de riesgo',
      'Asignado a','Creado','Actualizado','Due date',
    ],
    columnKeyMap: {
      'Número':'numero','Estado':'estado','Resumen':'resumen','Prioridad':'prioridad',
      'Puntuación de riesgo':'puntuacionRiesgo','Asignado a':'asignadoA',
      'Creado':'creado','Actualizado':'actualizado','Due date':'dueDate',
    },
  },
  // placeholder hasta que fijemos contrato SOUP
  Soup: {
    listUrl: 'http://localhost:8000/soup/risk-data/',
    uploadUrl: 'http://localhost:8000/soup/upload_data/',
    saveUrl: 'http://localhost:8000/soup/save_selection/',
    visibleColumns: [
      'Número','Estado','Resumen','Asignado a','Creado','Actualizado','Due date',
    ],
    columnKeyMap: {
      'Número':'numero','Estado':'estado','Resumen':'resumen',
      'Asignado a':'asignadoA','Creado':'creado','Actualizado':'actualizado','Due date':'dueDate',
    },
  },
};
