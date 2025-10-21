// src/modules/Main/Components/DisplayData/FilterBar.tsx
import { Box, IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

type Props = {
  // Estos dos no se usan aquí aún; los dejamos para el panel de columnas
  columns: string[];
  setColumns: React.Dispatch<React.SetStateAction<string[]>>;
  showPanel: boolean;
  togglePanel: () => void;
  handleDownload: () => void;
  onResetView?: () => void; // ⬅️ NUEVO
};

export default function FilterBar({
  // prefijamos con _ para evitar warnings de “never read”
  columns: _columns,
  setColumns: _setColumns,
  showPanel,
  togglePanel,
  handleDownload,
  onResetView,
}: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton aria-label="Filter columns" color="primary" onClick={togglePanel}>
        <FilterListIcon />
      </IconButton>

      <IconButton
        aria-label="Reset view"
        color="primary"
        onClick={() => onResetView && onResetView()}
      >
        <RefreshIcon />
      </IconButton>

      <IconButton aria-label="Download CSV" color="primary" onClick={handleDownload}>
        <DownloadIcon />
      </IconButton>
    </Box>
  );
}