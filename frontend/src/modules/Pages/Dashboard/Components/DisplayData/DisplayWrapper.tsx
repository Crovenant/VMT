// src/modules/Pages/Dashboard/Components/DisplayData/DisplayWrapper.tsx
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Title from '../Title/Title';
import FilterBar from './FilterBar';
import DisplayTable from './DisplayTable';
import useDisplayData from '../../hooks/useDisplayData';
import LatchWidget from './Widgets/LatchWidget';
import UploadFileWrapper from '../../../../Shared/Components/UploadFileWrapper';
import { useColumnMap } from './DisplayTable/hooks/useColumnMap';

type ViewType = 'VIT' | 'VUL';
type ViewKind = 'VIT' | 'VUL' | 'VUL_TO_VIT' | 'VUL_CSIRT' | 'VUL_CSO';

const SCHEMA: Record<
  ViewType,
  { listUrl: string; uploadUrl: string; saveUrl: string; defaultColumns: string[] }
> = {
  VIT: {
    listUrl: 'http://localhost:8000/vit/risk-data/',
    uploadUrl: 'http://localhost:8000/vit/upload/',
    saveUrl: 'http://localhost:8000/vit/save-selection/',
    defaultColumns: [
      'Número',
      'Estado',
      'Breve descripción',
      'Elemento de configuración',
      'Prioridad',
      'Asignado a',
      'Creado',
      'Due date',
    ],
  },
  VUL: {
    listUrl: 'http://localhost:8000/vul/risk-data/',
    uploadUrl: 'http://localhost:8000/vul/upload/',
    saveUrl: 'http://localhost:8000/vul/save-selection/',
    defaultColumns: ['Vulnerability ID', 'State', 'Severity', 'VUL Code', 'VIT Code'],
  },
};

const LS_VIEW = 'displayData.viewType';
const LS_COLS = (v: ViewType) => `displayData.visibleColumns.${v}`;

declare global {
  interface Window {
    exportFilteredDataToExcel: () => void;
  }
}

interface Props {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null | undefined;
  onResetView?: () => void;
  setShowUploadModal?: (val: boolean) => void;
}

export default function DisplayWrapper({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  onResetView,
  setShowUploadModal,
}: Props) {
  const [viewType, _setViewType] = useState<ViewType>(() => {
    const saved = localStorage.getItem(LS_VIEW);
    return saved === 'VUL' || saved === 'VIT' ? (saved as ViewType) : 'VIT';
  });
  const setViewType = (v: ViewType) => {
    localStorage.setItem(LS_VIEW, v);
    _setViewType(v);
  };

  const { allColumns: allowedColumns } = useColumnMap(viewType);

  // Modal Upload (solo VIT operativo)
  const [uploadOpen, setUploadOpen] = useState(false);

  const schema = SCHEMA[viewType];
  const { rows, showFilterPanel } = useDisplayData({
    refreshKey,
    priorityFilter,
    selectedItemId,
    customFlagFilter,
    viewType,
    listUrl: schema.listUrl,
  });

  const [visibleColumns, setVisibleColumns] = useState<string[]>(SCHEMA[viewType].defaultColumns);

  useEffect(() => {
    const allowed = new Set(allowedColumns);
    const saved = localStorage.getItem(LS_COLS(viewType));
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((c) => allowed.has(String(c)));
          setVisibleColumns(filtered.length ? filtered : SCHEMA[viewType].defaultColumns);
          return;
        }
      } catch { /* ignore */ }
    }
    setVisibleColumns(SCHEMA[viewType].defaultColumns);
  }, [viewType, allowedColumns]);

  useEffect(() => {
    const allowed = new Set(allowedColumns);
    const filtered = visibleColumns.filter((c) => allowed.has(String(c)));
    localStorage.setItem(
      LS_COLS(viewType),
      JSON.stringify(filtered.length ? filtered : SCHEMA[viewType].defaultColumns),
    );
  }, [viewType, visibleColumns, allowedColumns]);

  // Solo abrir modal si es VIT
  const handleUploadByKind = (kind: ViewKind) => {
    if (kind !== 'VIT') return; // no-op para cualquier otro botón
    setUploadOpen(true);
    setShowUploadModal?.(true);
  };

  const handleUploadClose = (success: boolean) => {
    setUploadOpen(false);
    setShowUploadModal?.(false);
    if (success) {
      onResetView?.();
    }
  };

  // Endpoints forzados a VIT para el modal
  const endpoints = SCHEMA.VIT;
  const current = SCHEMA[viewType];

  return (
    <>
      <Box display="grid" gridTemplateColumns="1fr auto auto" alignItems="center" columnGap={2} mb={0.5}>
        <Box>
          <Title>{`${viewType} view`}</Title>
        </Box>

        <Box display="flex" justifyContent="center">
          <LatchWidget viewType={viewType} onSwitchView={(v: ViewType) => setViewType(v)} />
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <FilterBar
            handleDownload={() => {
              if (typeof window.exportFilteredDataToExcel === 'function') window.exportFilteredDataToExcel();
            }}
            onResetView={onResetView}
            onUpload={handleUploadByKind}
          />
        </Box>
      </Box>

      <DisplayTable
        rows={rows}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        showFilterPanel={showFilterPanel}
        viewType={viewType}
        setShowUploadModal={setShowUploadModal}
      />

      <Dialog open={uploadOpen} onClose={() => handleUploadClose(false)} maxWidth="sm" fullWidth>
        <Box p={3}>
          <UploadFileWrapper
            onClose={handleUploadClose}
            uploadUrl={endpoints.uploadUrl}
            saveUrl={endpoints.saveUrl}
            listUrlForMutate={current.listUrl} // recargar la vista activa tras subir (ok)
          />
        </Box>
      </Dialog>
    </>
  );
}
