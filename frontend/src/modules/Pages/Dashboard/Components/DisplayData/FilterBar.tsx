// src/modules/Pages/Dashboard/Components/DisplayData/FilterBar.tsx
import { Box, IconButton, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

type Props = {
  togglePanel: () => void;
  handleDownload: () => void;
  onResetView?: () => void;
};

export default function FilterBar({
  togglePanel,
  handleDownload,
  onResetView,
}: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="Filter view">
        <IconButton aria-label="Filter columns" color="primary" onClick={togglePanel}>
          <FilterListIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Refresh view">
        <IconButton
          aria-label="Reset view"
          color="primary"
          onClick={() => onResetView && onResetView()}
        >
          <RefreshIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Download current view">
        <IconButton aria-label="Download CSV" color="primary" onClick={handleDownload}>
          <DownloadIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}