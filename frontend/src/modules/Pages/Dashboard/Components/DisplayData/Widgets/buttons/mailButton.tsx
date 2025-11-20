import { Tooltip, IconButton } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

type MailButtonProps = {
  onClick: () => void;
  size?: 'small' | 'medium';
  color?: 'primary' | 'secondary' | 'default';
};

export default function MailButton({
  onClick,
  size = 'small',
  color = 'primary',
}: MailButtonProps) {
  return (
    <Tooltip title="Send Mail">
      <IconButton
        aria-label="Send Mail"
        color={color}
        size={size}
        onClick={onClick}
      >
        <MailOutlineIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>
    </Tooltip>
  );
}