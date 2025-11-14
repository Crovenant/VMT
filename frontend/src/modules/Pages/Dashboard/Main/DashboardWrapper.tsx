// src/modules/Pages/Dashboard/DashboardWrapper.tsx
import React from 'react';
import { Box, CssBaseline, Popover, Typography, Grid } from '@mui/material';
import UploadFileWrapper from '../../../Shared/Components/UploadFileWrapper';
import DashboardHeader from '../Components/Dashboard/DashboardHeader';
import DashboardContent from '../Components/Dashboard/DashboardContent';
import useDisplayData from '../hooks/useDisplayData'; // <-- un nivel más arriba


const VIT_ENDPOINTS = {
  uploadUrl: 'http://localhost:8000/vit/upload/',
  saveUrl:   'http://localhost:8000/vit/save-selection/',
  listUrl:   'http://localhost:8000/vit/risk-data/',
};

export default function DashboardWrapper() {
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [priorityFilter, setPriorityFilter] = React.useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null); // <- string | null
  const [customFlagFilter, setCustomFlagFilter] = React.useState<'followUp' | 'soonDue' | null>(null);

  // 🔁 Auto-refresh cada 30 min
  React.useEffect(() => {
    let timer: number | undefined;

    const stop = () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => {
        setRefreshKey((k) => k + 1);
      }, 1800000); // 30 min
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleUploadClose = (success: boolean) => {
    setShowUploadModal(false);
    if (success) {
      setShowConfirmation(true);
      setRefreshKey((prev) => prev + 1);
      setTimeout(() => setShowConfirmation(false), 4000);
    }
  };

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleResetView = () => {
    setPriorityFilter(null);
    setSelectedItemId(null);
    setCustomFlagFilter(null);
    setRefreshKey((prev) => prev + 1);
  };

  // ✅ Datos para VIT (para el contador de la campana)
  const { rows } = useDisplayData({
    refreshKey,
    priorityFilter: null,
    selectedItemId: null,
    customFlagFilter: null,
    viewType: 'VIT',
    listUrl: VIT_ENDPOINTS.listUrl,
  });

  const followUpItems = rows.filter((item) => item.followUp);
  const soonDueItems = rows.filter((item) => item.soonDue);
  const followUpCount = followUpItems.length + soonDueItems.length;

  let bellColor: 'inherit' | 'default' | 'error' | 'warning' | 'info' | 'success' = 'inherit';
  if (followUpItems.length > 0) bellColor = 'error';
  else if (soonDueItems.length > 0) bellColor = 'warning';

  const openPopover = Boolean(anchorEl);
  const id = openPopover ? 'bell-popover' : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <DashboardHeader
        bellColor={bellColor}
        followUpCount={followUpCount}
        handleBellClick={handleBellClick}
      />

      <DashboardContent
        refreshKey={refreshKey}
        priorityFilter={priorityFilter}
        selectedItemId={selectedItemId}               // <- string | null
        customFlagFilter={customFlagFilter}
        setPriorityFilter={setPriorityFilter}
        setSelectedItemId={setSelectedItemId}         // <- (val: string | null) => void
        setCustomFlagFilter={setCustomFlagFilter}
        setShowUploadModal={setShowUploadModal}
        onResetView={handleResetView}
      />

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
          <Box sx={{ backgroundColor: '#fff', padding: 2, borderRadius: 4, boxShadow: 5 }}>
            <UploadFileWrapper
              onClose={handleUploadClose}
              uploadUrl={VIT_ENDPOINTS.uploadUrl}
              saveUrl={VIT_ENDPOINTS.saveUrl}
              listUrlForMutate={VIT_ENDPOINTS.listUrl}
            />
          </Box>
        </Box>
      )}

      {showConfirmation && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            backgroundColor: '#4caf50',
            color: '#fff',
            padding: 2,
            borderRadius: 4,
            boxShadow: 3,
            zIndex: 1400,
          }}
        >
          File accepted
        </Box>
      )}

      <Popover
        id={id}
        open={openPopover}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            Follow-up Items
          </Typography>
          {followUpItems.length === 0 && soonDueItems.length === 0 ? (
            <Typography variant="body2">No items to show.</Typography>
          ) : (
            <Grid container direction="column">
              {[...followUpItems, ...soonDueItems].map((item, idx) => {
                const isExpired = followUpItems.includes(item);
                return (
                  <Box
                    key={idx}
                    sx={{
                      mb: 1,
                      p: 1,
                      border: '1px solid #ccc',
                      borderRadius: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onClick={() => {
                      // Siempre string -> compatible con useDisplayData (String match)
                      setSelectedItemId(String(item.id));
                      setAnchorEl(null);
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>
                      {isExpired ? '🔴' : '🟠'}
                    </span>
                    <Typography variant="body2">
                      <strong>{item.numero}</strong> - {item.prioridad} - {item.resumen}
                    </Typography>
                  </Box>
                );
              })}
            </Grid>
          )}
        </Box>
      </Popover>
    </Box>
  );
}
