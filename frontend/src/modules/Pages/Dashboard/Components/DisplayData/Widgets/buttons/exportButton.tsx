// src/modules/Pages/Dashboard/Components/DisplayData/Widgets/buttons/exportButton.tsx
import { Tooltip, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

type ExportButtonProps = {
  onClick: () => void;
  size?: 'small' | 'medium';
  color?: 'primary' | 'secondary' | 'default';
};

export default function ExtButton({
  onClick,
  size = 'small',
  color = 'primary',
}: ExportButtonProps) {
  return (
    <Tooltip title="Export to Excel">
      <IconButton
        aria-label="Download Excel"
        color={color}
        size={size}
        onClick={onClick}
      >
        <DownloadIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>
    </Tooltip>
  );
}
