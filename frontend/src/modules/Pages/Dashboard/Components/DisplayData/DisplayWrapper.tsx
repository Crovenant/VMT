// src/modules/Main/Components/DisplayData/DisplayWrapper.tsx
import { Box } from '@mui/material';
import Title from '../Title';
import FilterBar from './FilterBar';
import DisplayTable from './DisplayTable';
import useDisplayData from '../../hooks/useDisplayData';
import { useState } from 'react';
import LatchWidget from './Widgets/LatchWidget';

export default function DisplayWrapper({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  onResetView,
}: {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null;
  onResetView?: () => void;
}) {
  const { rows, visibleColumns, showFilterPanel, handleDownload } =
    useDisplayData({ refreshKey, priorityFilter, selectedItemId, customFlagFilter });

  const [viewType, setViewType] = useState<'Tshirt' | 'Soup'>('Tshirt');

  const handleUpload = (type: 'Tshirt' | 'Soup') => {
    console.log(`Uploading file for ${type}`);
    // Lógica real de upload
  };

  return (
    <>
      {/* Cabecera */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2, position: 'relative' }}>
        <Title>{viewType === 'Tshirt' ? 'TSHIRT view' : 'SOUP view'}</Title>

        {/* LatchWidget centrado */}
        <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <LatchWidget viewType={viewType} onSwitchView={(type) => setViewType(type)} />
        </Box>

        {/* Barra de filtros a la derecha */}
        <FilterBar
          handleDownload={handleDownload}
          onResetView={onResetView}
          onUpload={handleUpload}
        />
        </Box>

      {/* Tabla */}
      <DisplayTable rows={rows} visibleColumns={visibleColumns} showFilterPanel={showFilterPanel} />
    </>
  );
}