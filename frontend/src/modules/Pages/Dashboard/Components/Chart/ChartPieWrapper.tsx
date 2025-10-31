import { Box, MenuItem, Select } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useItems from '../../../../Shared/hooks/useItems';
import { useState } from 'react';

export default function ChartPieWrapper({ refreshKey }: { refreshKey: number }) {
  const { items } = useItems(refreshKey);
  const [viewMode, setViewMode] = useState<'priority' | 'status'>('status');

  const priorityColors: Record<string, string> = {
    Crítico: '#d32f2f',
    Alto: '#f57c00',
    Medio: '#1976d2',
    Bajo: '#388e3c',
  };

  const stateColors: Record<string, string> = {
    Abierto: '#0288d1',
    Cerrado: '#6a1b9a',
    'En progreso': '#7cb342',
  };

  const data =
    viewMode === 'priority'
      ? ['Crítico', 'Alto', 'Medio', 'Bajo'].map((p) => ({
          name: p,
          value: items.filter((i) => i.prioridad === p).length,
          color: priorityColors[p],
        }))
      : ['Abierto', 'Cerrado', 'En progreso'].map((s) => ({
          name: s,
          value: items.filter((i) => i.estado === s).length,
          color: stateColors[s],
        }));

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '120px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="40%"
            cy="50%"
            outerRadius={60} // tamaño adecuado para el contenedor
            
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip cursor={false} />
        </PieChart>
      </ResponsiveContainer>
      <Box
        sx={{
          position: 'absolute',
          bottom: -21,
          right: -14,
        }}
      >
        <Select
          size="small"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'priority' | 'status')}
          sx={{
            fontSize: '0.6rem',
            minWidth: 65,
            height: 22,
            padding: 0,
          }}
        >
          <MenuItem value="priority" sx={{ fontSize: '0.6rem' }}>
            Priority
          </MenuItem>
          <MenuItem value="status" sx={{ fontSize: '0.6rem' }}>
            Status
          </MenuItem>
        </Select>
      </Box>
    </Box>
  );
}