// src/modules/Pages/Dashboard/Components/DisplayData/FilterBar.tsx
import { useState, useCallback, memo } from 'react';
import { Box, IconButton, Tooltip, Popover, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

type ViewKind = 'VIT' | 'VUL_CSIRT' | 'VUL_CSO' | 'VUL_TO_VIT';

type Props = {
  handleDownload: () => void;
  onResetView?: () => void;
  onUpload: (type: ViewKind) => void;
};

type TileProps = {
  label: string;
  src: string;
  onClick: () => void;
  disabled?: boolean;
};

const Tile = memo(function Tile({ label, src, onClick, disabled }: TileProps) {
  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onClick()}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-disabled={disabled}
      sx={{
        width: 56,
        p: 0.6,
        borderRadius: 1.5,
        cursor: disabled ? 'not-allowed' : 'pointer',
        bgcolor: 'background.paper',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease',
        opacity: disabled ? 0.45 : 1,
        '&:hover': disabled ? {} : { transform: 'translateY(-2px)', boxShadow: 3 },
        '&:active': disabled ? {} : { transform: 'translateY(0)' },
      }}
      title={disabled ? 'No operativo' : undefined}
    >
      <img src={src} alt={label} width={24} height={24} style={{ display: 'block', filter: disabled ? 'grayscale(100%)' : 'none' }} />
      <Typography variant="caption" sx={{ fontSize: 10, textAlign: 'center', lineHeight: 1.1, userSelect: 'none' }}>
        {label}
      </Typography>
    </Box>
  );
});

// Ajuste de alineado horizontal del popover
const SHIFT_LEFT_PX = -180;

export default function FilterBar({ handleDownload, onResetView, onUpload }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const toggleUploadMenu = useCallback((e?: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(prev => (prev ? null : (e?.currentTarget ?? null)));
  }, []);

  const closeMenu = useCallback(() => setAnchorEl(null), []);

  const handleRefresh = useCallback(() => {
    onResetView?.();
    if (typeof (window as any).clearAllFilters === 'function') (window as any).clearAllFilters();
  }, [onResetView]);

  // Solo permitimos VIT
  const act = useCallback(
    (kind: ViewKind) => {
      if (kind !== 'VIT') return; // no-op
      onUpload('VIT');
      closeMenu();
    },
    [onUpload, closeMenu],
  );

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
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
        <IconButton aria-label="Upload" color="primary" size="small" onClick={toggleUploadMenu}>
          <CloudUploadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          elevation: 6,
          sx: { px: 1, py: 1, borderRadius: 2, ml: `${SHIFT_LEFT_PX}px` },
        }}
        keepMounted
      >
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Tile label="VUL CSIRT" src="/upload_vul_icon.svg" onClick={() => act('VUL_CSIRT')} disabled />
          <Tile label="VUL CSO"   src="/upload_vul_icon.svg" onClick={() => act('VUL_CSO')} disabled />
          <Tile label="VIT"       src="/upload_vit_icon.svg" onClick={() => act('VIT')} />
          <Tile label="VUL→VIT"   src="/map_vul_to_vit_icon.svg" onClick={() => act('VUL_TO_VIT')} disabled />
        </Box>
      </Popover>
    </Box>
  );
}
