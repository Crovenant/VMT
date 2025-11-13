import { Box, CssBaseline, Container, Grid, Paper, Toolbar, Drawer, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardHeader from '../Dashboard/Components/Dashboard/DashboardHeader';
import { DashboardListItem, CsoListItem, ReportsListItem } from '../Dashboard/Components/ListItems/ListWrapper';
import Chart from '../Dashboard/Components/Chart/Chart';
import ChartPieWrapper from '../Dashboard/Components/Chart/ChartPieWrapper';
import FocusWrapper from '../Dashboard/Components/FocusItems/FocusWrapper';
import DisplayWrapper from '../Dashboard/Components/DisplayData/DisplayWrapper';

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

const CompactPaper = styled(Paper)(({ theme }) => ({
  height: 160,
  padding: theme.spacing(2),
  display: 'flex',
  overflow: 'hidden',
  flexDirection: 'column',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
  border: 'none',
}));

export default function CSODashboard() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <DashboardHeader bellColor="inherit" followUpCount={0} handleBellClick={() => {}} />

      <DrawerStyled variant="permanent" open>
        <DashboardListItem />
        <CsoListItem />
        <ReportsListItem />
      </DrawerStyled>

      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
          <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
            CSO Dashboard
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <CompactPaper>
                <Chart refreshKey={0} onSelectPriority={() => {}} />
              </CompactPaper>
            </Grid>

            <Grid item xs={12} md={3} lg={3}>
              <CompactPaper>
                <ChartPieWrapper refreshKey={0} />
              </CompactPaper>
            </Grid>

            <Grid item xs={12} md={3} lg={3}>
              <CompactPaper sx={{ alignItems: 'center', justifyContent: 'center' }}>
                <FocusWrapper refreshKey={0} onFilterByFlag={() => {}} />
              </CompactPaper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  overflow: 'auto',
                  flexDirection: 'column',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                  border: 'none',
                }}
              >
                <DisplayWrapper refreshKey={0} hideToggle /> {/* ✅ Oculta toggle, mantiene botones */}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
