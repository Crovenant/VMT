import { norm } from './normalize';

export const getWarningColor = (priority: unknown): string => {
  switch (norm(priority)) {
    case 'critico':
    case 'critica':
    case 'critical':
      return '#d32f2f';
    case 'alto':
    case 'alta':
    case 'high':
      return '#f57c00';
    case 'medio':
    case 'media':
    case 'medium':
      return '#fbc02d';
    case 'bajo':
    case 'baja':
    case 'low':
      return '#1976d2';
    default:
      return '#9e9e9e';
  }
};