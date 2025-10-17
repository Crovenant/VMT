// modules/components/Chart/ChartWrapper.tsx
import Title from '../Title';
import ChartBar from './ChartBar';
import useItems from '../../hooks/useItems';

export default function ChartWrapper({
  refreshKey,
  onSelectPriority,
}: {
  refreshKey: number;
  onSelectPriority: (prioridad: string) => void;
}) {
  const { items } = useItems(refreshKey);

  const priorityColors: Record<string, string> = {
    Crítico: '#d32f2f',
    Alto: '#f57c00',
    Medio: '#1976d2',
    Bajo: '#388e3c',
  };

  const chartData = ['Crítico', 'Alto', 'Medio', 'Bajo'].map(prioridad => ({
    prioridad,
    cantidad: items.filter(i => i.prioridad === prioridad).length,
    color: priorityColors[prioridad],
  }));

  return (
    <>
      <Title>Priority</Title>
      <ChartBar data={chartData} onSelectPriority={onSelectPriority} />
    </>
  );
}