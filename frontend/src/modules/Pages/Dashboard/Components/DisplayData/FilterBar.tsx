// src/modules/Pages/Dashboard/Components/DisplayData/FilterBar.tsx
import { Box, IconButton, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

type Props = {
  togglePanel: () => void;
  handleDownload: () => void;
  onResetView?: () => void;
  onShowUploadModal: () => void;
};

export default function FilterBar({
  togglePanel,
  handleDownload,
  onResetView,
  onShowUploadModal,
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
          onClick={() => {
            if (onResetView) {
              onResetView();
            }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Export to Excel">
        <IconButton aria-label="Download Excel" color="primary" onClick={handleDownload}>
          <DownloadIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Upload file">
        <IconButton
          aria-label="Upload file"
          sx={{ color: 'green' }}
          onClick={onShowUploadModal}
        >
          <CloudUploadIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}