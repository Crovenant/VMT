// src/modules/Main/Components/ListItems/ListWrapper.tsx
import { Box, IconButton, Tooltip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListTable from './ListTable';
import useItems from '../../../../Shared/hooks/useItems';
import { useNavigate } from 'react-router-dom';
import type { Item } from '../../../../Types/item';

type UploadSetter = { setShowUploadModal: (val: boolean) => void };

// Componente para el botón de subir fichero
export function MainListItems({ setShowUploadModal }: UploadSetter) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#eeeeee',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      <Tooltip title="Upload Excel file">
        <IconButton onClick={() => setShowUploadModal(true)} disableRipple sx={{ p: 0 }}>
          <CloudUploadIcon sx={{ fontSize: 36, color: '#01a301f8' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

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
