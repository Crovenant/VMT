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
  onResetView,                 // ⬅️ NUEVO
}: {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null;
  onResetView?: () => void;     // ⬅️ NUEVO (opcional)
}) {
  const {
    rows,
    visibleColumns,
    setVisibleColumns,
    visibleRows,
    setVisibleRows,
    showFilterPanel,
    setShowFilterPanel,
    handleDownload,
  } = useDisplayData({ refreshKey, priorityFilter, selectedItemId, customFlagFilter });

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Title>Vulnerability list</Title>
        <FilterBar
          columns={visibleColumns}
          setColumns={setVisibleColumns}
          showPanel={showFilterPanel}
          togglePanel={() => setShowFilterPanel(!showFilterPanel)}
          handleDownload={handleDownload}
          onResetView={onResetView}     // ⬅️ pasa el handler al botón
        />
      </Box>

      <DisplayTable
        rows={rows}
        visibleColumns={visibleColumns}
        visibleRows={visibleRows}
        setVisibleRows={setVisibleRows}
        showFilterPanel={showFilterPanel}
      />
    </>
  );
}