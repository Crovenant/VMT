import React from 'react';
import {
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Container,
  Grid,
  Paper,
  Divider,
  List,
  Link,
  Drawer,
  Popover
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { mainListItems, secondaryListItems } from './listItems';
import Chart from './Chart';
import CritItems from './focus_Items';
import Orders from './display_Data';
import UploadFile from './upload_File';
import useItems from './hooks/useItems';

const drawerWidth = 72;

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    overflowX: 'hidden',
    transition: 'none',
  },
}));

const ToolbarIcon = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 8px',
  ...theme.mixins.toolbar,
}));

const FixedHeightPaper = styled(Paper)(({ theme }) => ({
  height: 240,
  padding: theme.spacing(2),
  display: 'flex',
  overflow: 'auto',
  flexDirection: 'column',
}));

const ConfirmationBox = styled('div')(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  backgroundColor: '#4caf50',
  color: '#fff',
  padding: theme.spacing(2),
  borderRadius: 4,
  boxShadow: theme.shadows[3],
  zIndex: 1400,
}));

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link>https://siteYour Website {new Date().getFullYear()}</Link>{' '}
      {'.'}
    </Typography>
  );
}

export default function Dashboard() {
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [priorityFilter, setPriorityFilter] = React.useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(null);
  const [customFlagFilter, setCustomFlagFilter] = React.useState<'followUp' | 'soonDue' | null>(null);

  const handleUploadClose = (success: boolean) => {
    setShowUploadModal(false);
    if (success) {
      setShowConfirmation(true);
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setShowConfirmation(false), 4000);
    }
  };

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleFilterByFlag = (flag: 'followUp' | 'soonDue') => {
    setSelectedItemId(null);
    setPriorityFilter(null);
    setCustomFlagFilter(flag);
  };

  const { items } = useItems(refreshKey);
  const followUpItems = items.filter(item => item.followUp);
  const soonDueItems = items.filter(item => item.soonDue);
  const followUpCount = followUpItems.length;

  let bellColor: 'inherit' | 'default' | 'error' | 'warning' | 'info' | 'success' = 'inherit';
  if (followUpItems.length > 0) {
    bellColor = 'error';
  } else if (soonDueItems.length > 0) {
    bellColor = 'warning';
  }

  const openPopover = Boolean(anchorEl);
  const id = openPopover ? 'bell-popover' : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="absolute" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Icono a la izquierda */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
        <img
                src="/VMTicon.png"
                alt="Logo"
                style={{ width: 32, height: 32, marginRight: 8 }}               
              />   
          {/* Título centrado */}      
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ fontWeight: 500 }}
            >
              Vulnerability Management Tool
            </Typography>
          </Box>

          {/* Campana a la derecha */}
          <IconButton color={bellColor} onClick={handleBellClick}>
            <Badge overlap="rectangular" badgeContent={followUpCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <DrawerStyled variant="permanent" open={true}>
        <ToolbarIcon />
        <Divider />
        <List>{mainListItems({ setShowUploadModal })}</List>
        <Divider />
        <List>{secondaryListItems}</List>
      </DrawerStyled>

      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={9}>
              <FixedHeightPaper>
                <Chart
                  refreshKey={refreshKey}
                  onSelectPriority={(p) => {
                    setSelectedItemId(null);
                    setCustomFlagFilter(null);
                    setPriorityFilter(p);
                  }}
                />
              </FixedHeightPaper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <FixedHeightPaper>
                <CritItems
                  refreshKey={refreshKey}
                  onFilterByFlag={handleFilterByFlag}
                />
              </FixedHeightPaper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', overflow: 'auto', flexDirection: 'column' }}>
                <Orders
                  refreshKey={refreshKey}
                  priorityFilter={priorityFilter}
                  selectedItemId={selectedItemId}
                  customFlagFilter={customFlagFilter}
                />
              </Paper>
            </Grid>
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>

        {showUploadModal && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1300,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#fff',
                padding: 2,
                borderRadius: 4,
                boxShadow: 5,
              }}
            >
              <UploadFile onClose={handleUploadClose} />
            </Box>
          </Box>
        )}

        {showConfirmation && <ConfirmationBox>File accepted</ConfirmationBox>}

        <Popover
          id={id}
          open={openPopover}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ p: 2, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>Follow-up Items</Typography>
            {followUpItems.length === 0 && soonDueItems.length === 0 ? (
              <Typography variant="body2">No items to show.</Typography>
            ) : (
              <List>
                {[...followUpItems, ...soonDueItems].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 1,
                      p: 1,
                      border: '1px solid #ccc',
                      borderRadius: 2,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setAnchorEl(null);
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{item.numero}</strong> - {item.prioridad} - {item.resumen}
                    </Typography>
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </Popover>
      </Box>
    </Box>
  );
}