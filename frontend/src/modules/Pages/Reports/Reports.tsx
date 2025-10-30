import { Box, CssBaseline, Container, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardHeader from '../Dashboard/Components/Dashboard/DashboardHeader';
import { DashboardListItem, ReportsListItem } from '../Dashboard/Components/ListItems/ListWrapper';

const drawerWidth = 72;

const Sidebar = styled('div')(() => ({
  width: drawerWidth,
  backgroundColor: '#eeeeee',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 32,
  paddingTop: 80,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Cabecera azul */}
      <DashboardHeader bellColor="inherit" followUpCount={0} handleBellClick={() => {}} />

      {/* Layout principal */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <Sidebar>
          <DashboardListItem />
          <ReportsListItem />
        </Sidebar>

        {/* Contenido con separación */}
        <Box sx={{ flex: 1, p: 3, mt: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
              Reports Dashboard
            </Typography>

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
      </Box>
    </Box>
  );
}