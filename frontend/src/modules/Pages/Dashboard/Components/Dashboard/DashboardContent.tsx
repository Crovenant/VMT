// src/modules/Main/Components/Dashboard/DashboardContent.tsx
import {
  Container, Grid, Paper, Box, Toolbar, Drawer,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Chart from '../Chart';
import FocusItems from '../FocusItems/FocusWrapper';
import DisplayData from '../DisplayData/DisplayWrapper';
import { MainListItems, DashboardListItem, ReportsListItem } from '../ListItems/ListWrapper';

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
  height: 240,
  padding: theme.spacing(2),
  display: 'flex',
  overflow: 'auto',
  flexDirection: 'column',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
        {MainListItems({ setShowUploadModal })}
        <ReportsListItem />
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
                <FocusItems
                  refreshKey={refreshKey}
                  onFilterByFlag={(flag: 'followUp' | 'soonDue') => {
                    setSelectedItemId(null);
                    setPriorityFilter(null);
                    setCustomFlagFilter(flag);
                  }}
                />
              </FixedHeightPaper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  overflow: 'auto',
                  flexDirection: 'column',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                }}
              >
                <DisplayData
                  refreshKey={refreshKey}
                  priorityFilter={priorityFilter}
                  selectedItemId={selectedItemId !== null ? String(selectedItemId) : null}
                  customFlagFilter={customFlagFilter}
                  onResetView={onResetView}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}