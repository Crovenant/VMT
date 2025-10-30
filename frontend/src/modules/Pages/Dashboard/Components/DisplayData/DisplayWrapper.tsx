// src/modules/Main/Components/DisplayData/DisplayWrapper.tsx
import { Box } from '@mui/material';
import Title from '../Title';
import FilterBar from './FilterBar';
import DisplayTable from './DisplayTable';
import useDisplayData from '../../hooks/useDisplayData';

export default function DisplayWrapper({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  onResetView,
  setShowUploadModal,
}: {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null;
  onResetView?: () => void;
  setShowUploadModal: (val: boolean) => void;
}) {
  const { rows, visibleColumns, showFilterPanel, setShowFilterPanel, handleDownload } =
    useDisplayData({ refreshKey, priorityFilter, selectedItemId, customFlagFilter });

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Title>Vulnerability list</Title>
        <FilterBar
          togglePanel={() => setShowFilterPanel(!showFilterPanel)}
          handleDownload={handleDownload}
          onResetView={onResetView}
          onShowUploadModal={() => setShowUploadModal(true)}
        />
      </Box>

      <DisplayTable rows={rows} visibleColumns={visibleColumns} showFilterPanel={showFilterPanel} />
    </>
  );
}