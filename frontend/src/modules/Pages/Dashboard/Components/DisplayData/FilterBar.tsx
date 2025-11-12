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
};

const Tile = memo(function Tile({ label, src, onClick }: TileProps) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      sx={{
        width: 50,
        p: 0.4,
        borderRadius: 1.5,
        cursor: 'pointer',
        bgcolor: 'background.paper',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
        '&:active': { transform: 'translateY(0)' },
      }}
    >
      <img src={src} alt={label} width={24} height={24} style={{ display: 'block' }} />
      <Typography variant="caption" sx={{ fontSize: 10, textAlign: 'center', lineHeight: 1.1, userSelect: 'none' }}>
        {label}
      </Typography>
    </Box>
  );
});

// Ajuste de alineado horizontal del popover (negativo => desplaza a la izquierda)
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

  const act = useCallback(
    (kind: ViewKind) => {
      onUpload(kind);
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

      {/* Popover horizontal ENCIMA y ALINEADO A LA IZQUIERDA (desplazamiento fijo) */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          elevation: 6,
          sx: { px: 1, py: 1, borderRadius: 2, ml: `${SHIFT_LEFT_PX}px` }, // ← ajusta aquí
        }}
        keepMounted
      >
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Tile label="CSIRT" src="/upload_vul_icon.svg" onClick={() => act('VUL_CSIRT')} />
          <Tile label="CSO"   src="/upload_vul_icon.svg" onClick={() => act('VUL_CSO')} />
          <Tile label="CSIRT" src="/upload_vit_icon.svg" onClick={() => act('VIT')} />
          <Tile label="VUL→VIT" src="/map_vul_to_vit_icon.svg" onClick={() => act('VUL_TO_VIT')} />
        </Box>
      </Popover>
    </Box>
  );
}
