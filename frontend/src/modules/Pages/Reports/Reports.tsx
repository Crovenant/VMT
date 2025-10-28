import {
  Box,
  Drawer,
  Toolbar,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { mainListItems, DashboardListItem, ReportsListItem } from '../Dashboard/Components/ListItems/ListWrapper';

const drawerWidth = 72;

const DrawerStyled = styled(Drawer)(() => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    overflowX: 'hidden',
    transition: 'none',
    backgroundColor: '#eeeeee',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 32,
    paddingTop: 80,
  },
}));

const FixedHeightPaper = styled(Paper)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  border: 'none',
}));

export default function Reports() {
  return (
    <>
      {/* Sidebar */}
      <DrawerStyled variant="permanent" open>
        <DashboardListItem />
        {mainListItems({ setShowUploadModal: () => {} })}
        <ReportsListItem />
      </DrawerStyled>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
          {/* Header */}
          <Typography
            variant="h4"
            sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}
          >
            Reports Dashboard
          </Typography>

          {/* Grid Layout */}
          <Grid container spacing={3}>
            {/* Filters Panel */}
            <Grid item xs={12} md={4}>
              <FixedHeightPaper>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Filters
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Aquí irán los filtros para generar informes.
                </Typography>
              </FixedHeightPaper>
            </Grid>

            {/* Report Content Panel */}
            <Grid item xs={12} md={8}>
              <FixedHeightPaper>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Report Content
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Aquí se mostrarán los gráficos y tablas del informe.
                </Typography>
              </FixedHeightPaper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}