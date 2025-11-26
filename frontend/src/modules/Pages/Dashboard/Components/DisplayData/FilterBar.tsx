
// src/modules/Pages/Dashboard/Components/DisplayData/FilterBar.tsx
import { Box, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete'; // Papelera
import LatchWidget from './Widgets/LatchWidget';

type ViewType = 'VIT' | 'VUL';

type Props = {
  handleDownload: () => void;
  onResetView?: () => void;
  onUpload: () => void;
  onDelete?: () => void; // acción para borrar filas seleccionadas
  hideToggle?: boolean;
  viewType: ViewType;
  onSwitchView: (v: ViewType) => void;
};

export default function FilterBar({
  handleDownload,
  onResetView,
  onUpload,
  onDelete,
  hideToggle,
  viewType,
  onSwitchView,
}: Props) {
  const handleRefresh = () => {
    onResetView?.();
    const win = window as Window & { clearAllFilters?: () => void };
    if (typeof win.clearAllFilters === 'function') {
      win.clearAllFilters();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {!hideToggle && <LatchWidget viewType={viewType} onSwitchView={onSwitchView} />}

      <Tooltip title="Refresh view">
        <IconButton aria-label="Reset view" color="primary" size="small" onClick={handleRefresh}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Export to Excel">
        <IconButton aria-label="Download Excel" color="primary" size="small" onClick={handleDownload}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Upload">
        <IconButton aria-label="Upload" color="primary" size="small" onClick={onUpload}>
          <CloudUploadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Papelera azul para borrar filas seleccionadas */}
      <Tooltip title="Delete selected rows">
        <IconButton
          aria-label="Delete rows"
          color="primary"
          size="small"
          onClick={onDelete}
          sx={{ ml: 0.5 }}
        >
          <DeleteIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
