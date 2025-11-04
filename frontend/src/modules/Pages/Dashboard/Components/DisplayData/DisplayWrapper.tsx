// src/modules/Pages/Dashboard/Components/DisplayData/DisplayWrapper.tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';

import Title from '../Title';
import FilterBar from './FilterBar';
import DisplayTable from './DisplayTable';
import useDisplayData from '../../hooks/useDisplayData';
import LatchWidget from './Widgets/LatchWidget';
import UploadFileWrapper from '../../../../Shared/Components/UploadFileWrapper';

type ViewType = 'Tshirt' | 'Soup';

interface Props {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null | undefined;
  onResetView?: () => void;
}

export default function DisplayWrapper({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  onResetView,
}: Props) {
  const { rows, visibleColumns, showFilterPanel, handleDownload } =
    useDisplayData({ refreshKey, priorityFilter, selectedItemId, customFlagFilter });

  const [viewType, setViewType] = useState<ViewType>('Tshirt');
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleUploadByKind = (kind: ViewType) => {
    if (kind === 'Soup') {
      console.warn('Upload Soup aún no implementado');
      return;
    }
    setViewType('Tshirt');
    setUploadOpen(true);
  };

  const handleUploadClose = (success: boolean) => {
    setUploadOpen(false);
    if (success && typeof onResetView === 'function') onResetView();
  };

  return (
    <>
      {/* Header en 3 columnas: izquierda título, centro toggle, derecha iconos */}
      <Box
        display="grid"
        gridTemplateColumns="1fr auto auto"
        alignItems="center"
        columnGap={2}
        mb={0.5}
      >
        {/* Izquierda: título pegado al card (sin margen extra) */}
        <Box>
          <Title>{viewType.toUpperCase()} view</Title>
        </Box>

        {/* Centro: toggle centrado respecto al ancho del card */}
        <Box display="flex" justifyContent="center">
          <LatchWidget viewType={viewType} onSwitchView={(v: ViewType) => setViewType(v)} />
        </Box>

        {/* Derecha: iconos/acciones */}
        <Box display="flex" justifyContent="flex-end">
          <FilterBar
            handleDownload={handleDownload}
            onResetView={onResetView}
            onUpload={handleUploadByKind}
          />
        </Box>
      </Box>

      {/* Tabla principal */}
      <DisplayTable
        rows={rows}
        visibleColumns={visibleColumns}
        showFilterPanel={showFilterPanel}
      />

      {/* Modal de subida */}
      <Dialog
        open={uploadOpen}
        onClose={() => handleUploadClose(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box p={3}>
          <UploadFileWrapper onClose={handleUploadClose} />
        </Box>
      </Dialog>
    </>
  );
}
