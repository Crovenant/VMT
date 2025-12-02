// frontend/src/modules/Pages/Reports/Reports.tsx
import { Box, CssBaseline, Container, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardHeader from '../Dashboard/Components/Dashboard/DashboardHeader';
import { DashboardListItem, CsoListItem, ReportsListItem } from '../Dashboard/Components/ListItems/ListWrapper';
import ChartsIndex from './Components/Charts/ChartsIndex';
import useReports from './hooks/useReports';

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
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  border: 'none',
}));

export default function Reports() {
  const { vitTotal, vulTotal } = useReports();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <DashboardHeader bellColor="inherit" followUpCount={0} handleBellClick={() => {}} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar>
          <DashboardListItem />
          <CsoListItem />
          <ReportsListItem />
        </Sidebar>
        <Box sx={{ flex: 1, p: 3, mt: 8 }}>
          <Container maxWidth="xl">
            <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
              Reports Dashboard
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={2}>
                <FixedHeightPaper sx={{ height: 250 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Filters
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Aquí irán los filtros para generar informes.
                  </Typography>
                </FixedHeightPaper>
              </Grid>
              <Grid item xs={12} md={10}>
                <FixedHeightPaper sx={{ height: 250 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Report Content
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ChartsIndex vitTotal={vitTotal} vulTotal={vulTotal} />
                  </Box>
                </FixedHeightPaper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
