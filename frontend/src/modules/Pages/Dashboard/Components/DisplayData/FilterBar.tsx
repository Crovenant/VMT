// src/modules/Pages/Dashboard/Components/DisplayData/FilterBar.tsx
import { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Popover,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

type Props = {
  handleDownload: () => void;
  onResetView?: () => void;
  onUpload: (type: 'Tshirt' | 'Soup') => void;
};

export default function FilterBar({
  handleDownload,
  onResetView,
  onUpload,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleUploadClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {/* Refresh */}
      <Tooltip title="Refresh view">
        <IconButton
          aria-label="Reset view"
          color="primary"
          size="small"
          onClick={() => {
            if (onResetView) onResetView();
          }}
          sx={{ fontSize: '16px' }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Download */}
      <Tooltip title="Export to Excel">
        <IconButton
          aria-label="Download Excel"
          color="primary"
          size="small"
          onClick={handleDownload}
          sx={{ fontSize: '16px' }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Upload con popover */}
      <Tooltip title="Upload file">
        <IconButton
          aria-label="Upload file"
          color="primary"
          size="small"
          onClick={handleUploadClick}
          sx={{ fontSize: '16px' }}
        >
          <CloudUploadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }} // Se abre lateralmente
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      >
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ fontSize: '12px', textTransform: 'uppercase' }}
            onClick={() => {
              onUpload('Tshirt');
              handleClose();
            }}
          >
            Upload Tshirt
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            sx={{ fontSize: '12px', textTransform: 'uppercase' }}
            onClick={() => {
              onUpload('Soup');
              handleClose();
            }}
          >
            Upload Soup
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}