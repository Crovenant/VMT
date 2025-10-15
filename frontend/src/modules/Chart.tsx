import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label
} from 'recharts';
import Title from './Title';
import useItems from './hooks/useItems';
import type { Item } from './hooks/useItems';

type Conteo = { [key: string]: number };

interface ChartProps {
  refreshKey: number;
  onSelectPriority: (prioridad: string) => void;
}

export default function Chart({ refreshKey, onSelectPriority }: ChartProps) {
  const theme = useTheme();
  const { items } = useItems(refreshKey);

  const conteo: Conteo = items.reduce((acc: Conteo, row: Item) => {
    acc[row.prioridad] = (acc[row.prioridad] || 0) + 1;
    return acc;
  }, {} as Conteo);

  const colores: { [key: string]: string } = {
    'Crítica': '#f44336',
    'Alta': '#ff9800',
    'Media': '#ffeb3b',
    'Baja': '#2196f3',
  };

  const data = ['Crítica', 'Alta', 'Media', 'Baja'].map(prioridad => ({
    prioridad,
    cantidad: conteo[prioridad] || 0,
    color: colores[prioridad] || '#000000',
  }));

  return (
    <>
      <Title>Priority</Title>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
          <XAxis dataKey="prioridad" stroke={theme.palette.text.secondary} />
          <YAxis stroke={theme.palette.text.secondary}>
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
            >
              Número de elementos
            </Label>
          </YAxis>
          <Tooltip
            formatter={(value, name) => [`${value}`, name]}
            labelFormatter={(label) => `Prioridad: ${label}`}
          />
          <Bar dataKey="cantidad" name="Cantidad">
            {data.map((entry) => (
              <Cell
                key={entry.prioridad}
                fill={entry.color}
                cursor="pointer"
                onClick={() => onSelectPriority(entry.prioridad)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
