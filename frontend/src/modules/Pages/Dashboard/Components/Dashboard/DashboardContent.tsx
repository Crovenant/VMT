import {
  Container, Grid, Paper, Box, Toolbar, Drawer,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Chart from '../Chart';
import FocusItems from '../FocusItems/FocusWrapper';
import DisplayData from '../DisplayData/DisplayWrapper';
import ChartPieWrapper from '../Chart/ChartPieWrapper';
import { DashboardListItem, ReportsListItem } from '../ListItems/ListWrapper';

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
  height: 160, // 🔍 Altura fija del card
  padding: theme.spacing(2), // 🔍 Espacio interno (reduce área útil para el gráfico)
  display: 'flex',
  overflow: 'hidden',
  flexDirection: 'column', // 🔍 Coloca título y gráfico en columna
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
  border: 'none',
}));


export default function DashboardContent({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  setPriorityFilter,
  setSelectedItemId,
  setCustomFlagFilter,
  setShowUploadModal,
  onResetView,
}: {
  refreshKey: number;
  priorityFilter: string | null;
  selectedItemId: number | null;
  customFlagFilter: 'followUp' | 'soonDue' | null;
  setPriorityFilter: (val: string | null) => void;
  setSelectedItemId: (val: number | null) => void;
  setCustomFlagFilter: (val: 'followUp' | 'soonDue' | null) => void;
  setShowUploadModal: (val: boolean) => void;
  onResetView: () => void;
}) {
  return (
    <>
      <DrawerStyled variant="permanent" open>
        <DashboardListItem />
        <ReportsListItem />
      </DrawerStyled>

      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
          <Grid container spacing={3}>
            {/* Priority Chart */}
            <Grid item xs={12} md={6} lg={6}>
              <CompactPaper>
                <Chart
                  refreshKey={refreshKey}
                  onSelectPriority={(p) => {
                    setSelectedItemId(null);
                    setCustomFlagFilter(null);
                    setPriorityFilter(p);
                  }}
                />
              </CompactPaper>
            </Grid>

            {/* Pie Chart */}
            <Grid item xs={12} md={3} lg={3}>
              <CompactPaper>
                <ChartPieWrapper refreshKey={refreshKey} />
              </CompactPaper>
            </Grid>

            {/* Focus Items */}
            <Grid item xs={12} md={3} lg={3}>
              <CompactPaper sx={{ alignItems: 'center', justifyContent: 'center' }}>
                <FocusItems
                  refreshKey={refreshKey}
                  onFilterByFlag={(flag: 'followUp' | 'soonDue') => {
                    setSelectedItemId(null);
                    setPriorityFilter(null);
                    setCustomFlagFilter(flag);
                  }}
                />
              </CompactPaper>
            </Grid>

            {/* Table */}
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
                <DisplayData
                  refreshKey={refreshKey}
                  priorityFilter={priorityFilter}
                  selectedItemId={selectedItemId !== null ? String(selectedItemId) : null}
                  customFlagFilter={customFlagFilter}
                  onResetView={onResetView}
                  setShowUploadModal={setShowUploadModal}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}