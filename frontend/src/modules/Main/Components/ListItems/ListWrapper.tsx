// src/modules/Main/Components/ListItems/ListWrapper.tsx
import { Box, IconButton, Tooltip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListTable from './ListTable';
import useItems from '../../hooks/useItems';

export function mainListItems({
  setShowUploadModal,
}: {
  setShowUploadModal: (val: boolean) => void;
}) {
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
      {/* Icono Upload */}
      <Tooltip title="Upload Excel file">
        <IconButton onClick={() => setShowUploadModal(true)} disableRipple sx={{ p: 0 }}>
          <CloudUploadIcon sx={{ fontSize: 36, color: '#01a301f8' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export const dashboardListItem = (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#eeeeee',
    }}
  >
    <Tooltip title="Dashboard">
      <IconButton disableRipple sx={{ p: 0 }}>
        <DashboardIcon sx={{ fontSize: 36, color: '#1976d2' }} />
      </IconButton>
    </Tooltip>
  </Box>
);

export const secondaryListItems = (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#eeeeee',
    }}
  >
    <Tooltip title="Reports">
      <IconButton disableRipple sx={{ p: 0 }}>
        <AssessmentIcon sx={{ fontSize: 36, color: '#f87c08ff' }} />
      </IconButton>
    </Tooltip>
  </Box>
);

export default function ListWrapper({
  refreshKey,
  filter,
}: {
  refreshKey: number;
  filter: string;
}) {
  const { items } = useItems(refreshKey);
  const filteredItems = items.filter(item => item.prioridad === filter);

  return <ListTable items={filteredItems} />;
}
