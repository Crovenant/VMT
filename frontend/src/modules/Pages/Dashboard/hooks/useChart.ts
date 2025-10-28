// modules/Main/hooks/useChart.ts
import useItems from '../../../Shared/hooks/useItems';
import type { Item } from '../../../Types/item';

export interface ChartData {
  prioridad: string;
  cantidad: number;
  color: string;
}

export default function useChart(refreshKey: number): ChartData[] {
  const { items } = useItems(refreshKey);

  const conteo: Record<string, number> = items.reduce((acc, row: Item) => {
    acc[row.prioridad] = (acc[row.prioridad] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colores: Record<string, string> = {
    'Crítico': '#f44336',
    'Alto': '#ff9800',
    'Medio': '#ffeb3b',
    'Bajo': '#2196f3',
  };

  return ['Crítico', 'Alto', 'Medio', 'Bajo'].map(prioridad => ({
    prioridad,
    cantidad: conteo[prioridad] || 0,
    color: colores[prioridad] || '#000000',
  }));
}