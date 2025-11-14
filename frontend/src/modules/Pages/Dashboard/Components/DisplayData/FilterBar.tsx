import { useState, useCallback, memo } from 'react';
import { Box, IconButton, Tooltip, Popover, Typography, Select, MenuItem } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LatchWidget from './Widgets/LatchWidget';

type ViewKind = 'VIT' | 'VUL_CSIRT' | 'VUL_CSO' | 'VUL_TO_VIT';
type ViewType = 'VIT' | 'VUL';

type Props = {
  handleDownload: () => void;
  onResetView?: () => void;
  onUpload: (type: ViewKind) => void;
  hideToggle?: boolean;
  viewType: ViewType;
  onSwitchView: (v: ViewType) => void;
  onSelectedViewChange: (v: 'CSIRT' | 'CSO') => void;
  forceSelectedView?: 'CSIRT' | 'CSO'; // ✅ Nueva prop para CSODashboard
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

const SHIFT_LEFT_PX = -180;

export default function FilterBar({
  handleDownload,
  onResetView,
  onUpload,
  hideToggle,
  viewType,
  onSwitchView,
  onSelectedViewChange,
  forceSelectedView,
}: Props) {
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
      if (kind !== 'VIT') return;
      onUpload('VIT');
      closeMenu();
    },
    [onUpload, closeMenu],
  );

  const [selectedView, setSelectedView] = useState<'CSIRT' | 'CSO'>('CSIRT');
  const effectiveSelectedView = forceSelectedView ?? selectedView;

  const handleSelectorChange = (value: 'CSIRT' | 'CSO') => {
    setSelectedView(value);
    onSelectedViewChange(value);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Selector solo si no está forzado */}
      {!forceSelectedView && (
        <Select
          value={effectiveSelectedView}
          onChange={(e) => handleSelectorChange(e.target.value as 'CSIRT' | 'CSO')}
          size="small"
          sx={{
            minWidth: 80,
            fontSize: 12,
            height: 28,
            '& .MuiSelect-select': { padding: '4px 8px' },
          }}
        >
          <MenuItem value="CSIRT">CSIRT</MenuItem>
          <MenuItem value="CSO">CSO</MenuItem>
        </Select>
      )}

      {/* Toggle solo si CSIRT y hideToggle false */}
      {effectiveSelectedView === 'CSIRT' && !hideToggle && (
        <LatchWidget viewType={viewType} onSwitchView={onSwitchView} />
      )}

      {/* Botones */}
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
          <Tile label="" src="/upload_vul_icon.svg" onClick={() => act('VUL_CSIRT')}/>
          <Tile label="" src="/upload_vit_icon.svg" onClick={() => act('VIT')} />
        </Box>
      </Popover>
    </Box>
  );
}