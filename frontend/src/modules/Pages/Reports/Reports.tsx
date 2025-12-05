
// frontend/src/modules/Pages/Reports/Reports.tsx
import { Box, CssBaseline, Container, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardHeader from '../Dashboard/Components/Dashboard/DashboardHeader';
import { DashboardListItem, CsoListItem, ReportsListItem } from '../Dashboard/Components/ListItems/ListWrapper';
import VitRadial from './Components/Charts/Radial/VitRadial';
import VulRadial from './Components/Charts/Radial/VulRadial';
import useReports from './hooks/useReports';
import FiltersIndex from './Components/Filters/FiltersIndex';
import VitBarchart from './Components/Charts/BarChart/VitBarchart';
import VulBarchart from './Components/Charts/BarChart/VulBarchart';
import CicularBarPlot from './Components/Charts/CicularBarPlot/CircularBarPlotChart';

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
  padding: 0,
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
              <Grid item xs={12} md={6}>
                <FixedHeightPaper sx={{ height: 375 }}>
                  <Box sx={{ display: 'flex', height: '100%' }}>
                    <Box sx={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center', ml: '60px' }}>
                      <VitRadial value={vitTotal} />
                    </Box>
                    <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateX(-8px)', willChange: 'transform' }}>
                      <CicularBarPlot width={300} height={300} />
                    </Box>
                  </Box>
                </FixedHeightPaper>
              </Grid>
              <Grid item xs={12} md={6}>
                <FixedHeightPaper sx={{ height: 375 }}>
                  <Box sx={{ display: 'flex', height: '100%' }}>
                    <Box sx={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center', ml: '60px' }}>
                      <VulRadial value={vulTotal} />
                    </Box>
                    <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateX(-8px)', willChange: 'transform' }}>
                      <CicularBarPlot width={300} height={300} />
                    </Box>
                  </Box>
                </FixedHeightPaper>
              </Grid>
              <Grid item xs={12} md={6}>
                <FixedHeightPaper sx={{ height: 96, justifyContent: 'center', alignItems: 'center' }}>
                  <FiltersIndex />
                </FixedHeightPaper>
              </Grid>
              <Grid item xs={12} md={6}>
                <FixedHeightPaper sx={{ height: 96, justifyContent: 'center', alignItems: 'center' }}>
                  <FiltersIndex />
                </FixedHeightPaper>
              </Grid>
              <Grid item xs={12} md={6}>
                <FixedHeightPaper sx={{ height: 300 }}>
                  <VitBarchart />
                </FixedHeightPaper>
              </Grid>
              <Grid item xs={12} md={6}>
                <FixedHeightPaper sx={{ height: 300 }}>
                  <VulBarchart />
                </FixedHeightPaper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
