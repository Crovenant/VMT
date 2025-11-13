// modules/components/Dashboard/DashboardHeader.tsx
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function DashboardHeader({
  bellColor,
  followUpCount,
  handleBellClick,
}: {
  bellColor: 'inherit' | 'default' | 'error' | 'warning' | 'info' | 'success';
  followUpCount: number;
  handleBellClick: (event: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <AppBar position="absolute" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1
        }}>
          <img
            src="/VMTicon.png"
            alt="Logo"
            style={{ width: 32, height: 32, marginRight: 8 }}
          />
          <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ fontWeight: 500 }}>
            Vulnerability Management Tool
          </Typography>
        </Box>
        <Tooltip title="Follow-up ítems">
          <IconButton color={bellColor} onClick={handleBellClick}>
            <Badge overlap="rectangular" badgeContent={followUpCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}