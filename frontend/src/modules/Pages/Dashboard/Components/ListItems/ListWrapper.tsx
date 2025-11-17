// src/modules/Main/Components/ListItems/ListWrapper.tsx
import { Box, IconButton, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'; // 
import ListTable from './ListTable';
import useItems from '../../../../Shared/hooks/useItems';
import { useNavigate } from 'react-router-dom';
import type { Item } from '../../../../Types/item';

// Botón para ir al Dashboard
export function DashboardListItem() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#eeeeee' }}>
      <Tooltip title="Dashboard">
        <IconButton onClick={() => navigate('/dashboard')} disableRipple sx={{ p: 0 }}>
          <DashboardIcon sx={{ fontSize: 36, color: '#1976d2' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// Botón para ir al CSO Dashboard (el rojo)
export function CsoListItem() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#eeeeee' }}>
      <Tooltip title="CSO Dashboard">
        <IconButton onClick={() => navigate('/csoDashboard')} disableRipple sx={{ p: 0 }}>
          <DashboardCustomizeIcon sx={{ fontSize: 36, color: '#dc3545' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// Botón para ir a Reports
export function ReportsListItem() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#eeeeee' }}>
      <Tooltip title="Reports">
        <IconButton onClick={() => navigate('/reports')} disableRipple sx={{ p: 0 }}>
          <AssessmentIcon sx={{ fontSize: 36, color: '#f87c08ff' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// Tabla filtrada por prioridad
export default function ListWrapper({
  refreshKey,
  filter,
}: {
  refreshKey: number;
  filter: string;
}) {
  const { items } = useItems(refreshKey);
  const filteredItems = items.filter((item: Item) => item.prioridad === filter);
  return <ListTable items={filteredItems} />;
}