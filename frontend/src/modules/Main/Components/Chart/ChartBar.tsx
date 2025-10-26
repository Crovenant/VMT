// modules/components/Chart/ChartBar.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import type { ChartData } from '../../hooks/useChart';

export default function ChartBar({
  data,
  onSelectPriority
}: {
  data: ChartData[];
  onSelectPriority: (prioridad: string) => void;
}) {
  const theme = useTheme();

  return (
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
  );
}