import { Box, MenuItem, Select } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useItems from '../../../../Shared/hooks/useItems';
import React, { useState } from 'react';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <ResponsiveContainer width="100%" height={100}>
        <PieChart margin={{ left: -10 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={40}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
        <Select
          size="small"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'priority' | 'status')}
          sx={{ fontSize: '0.65rem', minWidth: 70, height: 26 }}
        >
          <MenuItem value="priority">Priority</MenuItem>
          <MenuItem value="status">Status</MenuItem>
        </Select>
      </Box>
    </Box>
  );
}