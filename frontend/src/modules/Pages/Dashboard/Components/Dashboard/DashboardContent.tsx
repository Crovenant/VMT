// src/modules/Pages/Dashboard/Components/Dashboard/DashboardContent.tsx
import {
  Container, Grid, Paper, Box, Toolbar, Drawer,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Chart from '../Chart/Chart';
import FocusItems from '../FocusItems/FocusWrapper';
import DisplayData from '../DisplayData/DisplayWrapper';
import ChartPieWrapper from '../Chart/ChartPieWrapper';
import { DashboardListItem, CsoListItem, ReportsListItem } from '../ListItems/ListWrapper'; 
import type { Item } from '../../../../Types/item';

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

type Props = {
  refreshKey: number;
  priorityFilter: string | null;
  selectedItemId: string | null;
  customFlagFilter: 'followUp' | 'soonDue' | null;
  setPriorityFilter: (val: string | null) => void;
  setSelectedItemId: (val: string | null) => void;
  setCustomFlagFilter: (val: 'followUp' | 'soonDue' | null) => void;
  setShowUploadModal: (val: boolean) => void;
  onResetView: () => void;
  onOpenModal: (item: Item) => void; // ✅ Prop para abrir modal
};

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
  onOpenModal, // ✅ Recibida correctamente
}: Props) {
  return (
    <>
      <DrawerStyled variant="permanent" open>
        <DashboardListItem />
        <CsoListItem /> 
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
                  selectedItemId={selectedItemId}
                  customFlagFilter={customFlagFilter}
                  onResetView={onResetView}
                  setShowUploadModal={setShowUploadModal}
                  onOpenModal={onOpenModal} 
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}