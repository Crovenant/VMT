import { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, Popover, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

type ViewKind = 'Tshirt' | 'Soup' | 'VulToVit';

type Props = {
  handleDownload: () => void;
  onResetView?: () => void;
  onUpload: (type: ViewKind) => void;
};

export default function FilterBar({ handleDownload, onResetView, onUpload }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const toggleUploadMenu = useCallback((e?: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(prev => (prev ? null : (e?.currentTarget ?? null)));
  }, []);

  const closeMenu = useCallback(() => setAnchorEl(null), []);

  const handleRefresh = useCallback(() => {
    onResetView?.();
    if (typeof window.clearAllFilters === 'function') {
      window.clearAllFilters();
    }
  }, [onResetView]);

  const handleKeyActivate = useCallback(
    (kind: ViewKind) => {
      onUpload(kind);
      closeMenu();
    },
    [onUpload, closeMenu],
  );

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {/* Refresh */}
      <Tooltip title="Refresh view">
        <IconButton
          aria-label="Reset view"
          color="primary"
          size="small"
          onClick={handleRefresh}
          sx={{ fontSize: 16 }}
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
          sx={{ fontSize: 16 }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Upload (popover con tres opciones) */}
      <Tooltip title="Upload file">
        <IconButton
          aria-label="Upload file"
          color="primary"
          size="small"
          onClick={toggleUploadMenu}
          sx={{ fontSize: 16 }}
        >
          <CloudUploadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        keepMounted
      >
        <Box
          sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 160 }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeMenu();
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ fontSize: 11, textTransform: 'uppercase', padding: '4px 8px' }}
            onClick={() => handleKeyActivate('Tshirt')}
          >
            Upload TSHIRT
          </Button>

          <Button
            variant="contained"
            color="secondary"
            size="small"
            sx={{ fontSize: 11, textTransform: 'uppercase', padding: '4px 8px' }}
            onClick={() => handleKeyActivate('Soup')}
          >
            Upload SOUP
          </Button>

          <Button
            variant="contained"
            color="warning"
            size="small"
            sx={{ fontSize: 11, textTransform: 'uppercase', padding: '4px 8px' }}
            onClick={() => handleKeyActivate('VulToVit')}
          >
            Upload VUL TO VIT
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}