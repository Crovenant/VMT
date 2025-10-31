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
  onSelectPriority,
}: {
  data: ChartData[];
  onSelectPriority: (prioridad: string) => void;
}) {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barCategoryGap="3%" // barras más anchas
      >
        <XAxis
          dataKey="prioridad"
          stroke={theme.palette.text.secondary}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          width={30} // controla el ancho del eje Y (antes era automático)
          tickMargin={4} // separación mínima entre ticks y línea
          stroke={theme.palette.text.secondary}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          formatter={(value, name) => [`${value}`, name]}
          labelFormatter={(label) => `Priority: ${label}`}
        />
        <Bar dataKey="cantidad" name="Count" radius={[4, 4, 0, 0]}>
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