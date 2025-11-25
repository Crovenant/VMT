
import { Typography, Box } from '@mui/material';
import type { Entry } from '../../../../Types/item';

const fieldLabels: { [key: string]: string } = {
  // VIT
  numero: 'Número',
  idExterno: 'ID externo',
  estado: 'Estado',
  resumen: 'Resumen',
  breveDescripcion: 'Breve descripción',
  elementoConfiguracion: 'Elemento de configuración',
  prioridad: 'Prioridad',
  puntuacionRiesgo: 'Puntuación de riesgo',
  grupoAsignacion: 'Grupo de asignación',
  asignadoA: 'Asignado a',
  creado: 'Creado',
  actualizado: 'Actualizado',
  sites: 'Sites',
  vulnerabilitySolution: 'Vulnerability solution',
  vulnerabilidad: 'Vulnerabilidad',
  dueDate: 'Fecha límite',
  VUL: 'VUL',

  // VUL
  Número: 'Número',
  Activo: 'Activo',
  'Elementos vulnerables': 'Elementos vulnerables',
  'Asignado a': 'Asignado a',
  'Grupo de asignación': 'Grupo de asignación',
  Prioridad: 'Prioridad',
  Estado: 'Estado',
  Actualizado: 'Actualizado',
  VITS: 'VITS',
};

export function renderEntry(entry: Entry, compareWith?: Entry) {
  return (
    <Box sx={{ fontSize: 12, lineHeight: 1.4 }}>
      {Object.entries(fieldLabels)
        .filter(([key]) => key in entry)
        .map(([key, label]) => {
          const value = String(entry[key] ?? '');
          const isChanged = compareWith && compareWith[key] !== entry[key];
          return (
            <Typography
              key={key}
              variant="body2"
              sx={{ color: isChanged ? 'red' : 'inherit' }}
            >
              <strong>{label}:</strong> {value}
            </Typography>
          );
        })}
    </Box>
  );
}
