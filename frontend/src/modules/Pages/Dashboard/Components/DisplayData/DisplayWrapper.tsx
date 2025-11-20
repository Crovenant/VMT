import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Title from '../Title/Title';
import FilterBar from './FilterBar';
import DisplayTable from './DisplayTable';
import useDisplayData from '../../hooks/useDisplayData';
import UploadFileWrapper from '../../../../Shared/Components/UploadFileWrapper';
import { useColumnMap } from './DisplayTable/hooks/useColumnMap';
import type { Item } from '../../../../Types/item';

type ViewType = 'VIT' | 'VUL';
type ViewKind = 'VIT' | 'VUL' | 'VUL_TO_VIT' | 'VUL_CSIRT' | 'VUL_CSO';

const SCHEMA: Record<ViewType, { listUrl: string; uploadUrl: string; saveUrl: string; defaultColumns: string[] }> = {
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
    defaultColumns: [
      'Número',
      'Activo',
      'Elementos vulnerables',
      'Asignado a',
      'Grupo de asignación',
      'Prioridad',
      'Estado',
      'Actualizado',
      'VITS',
    ],
  },
};

const LS_VIEW = 'displayData.viewType';
const LS_COLS = (v: ViewType) => `displayData.visibleColumns.${v}`;

declare global {
  interface Window {
    exportFilteredDataToExcel: () => void;
    clearAllFilters?: () => void;
  }
}

interface Props {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null | undefined;
  onResetView?: () => void;
  setShowUploadModal?: (val: boolean) => void;
  hideToggle?: boolean;
  onOpenModal: (item: Item) => void; // ✅ Añadido
}

export default function DisplayWrapper({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  onResetView,
  setShowUploadModal,
  hideToggle = false,
  onOpenModal, // ✅ Recibido
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

  const hasLink = useCallback((item: Item): boolean => Boolean(item.hasLink), []);

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
      } catch {
        console.error('Error parsing saved columns');
      }
    }
    setVisibleColumns(SCHEMA[viewType].defaultColumns);
  }, [viewType, allowedColumns]);

  useEffect(() => {
    const allowed = new Set(allowedColumns);
    const filtered = visibleColumns.filter((c) => allowed.has(String(c)));
    localStorage.setItem(LS_COLS(viewType), JSON.stringify(filtered.length ? filtered : SCHEMA[viewType].defaultColumns));
  }, [viewType, visibleColumns, allowedColumns]);

  const handleUploadByKind = (kind: ViewKind) => {
    if (kind !== 'VIT') return;
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

  const endpoints = SCHEMA.VIT;
  const current = SCHEMA[viewType];

  return (
    <>
      <Box display="grid" gridTemplateColumns="1fr auto" alignItems="center" columnGap={2} mb={0.5}>
        <Box>
          <Title>{`CSIRT ${viewType} view`}</Title>
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <FilterBar
            handleDownload={() => {
              if (typeof window.exportFilteredDataToExcel === 'function') window.exportFilteredDataToExcel();
            }}
            onResetView={onResetView}
            onUpload={handleUploadByKind}
            hideToggle={hideToggle}
            viewType={viewType}
            onSwitchView={(v) => setViewType(v)}
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
        hasLink={hasLink}
        onOpenModal={onOpenModal} // ✅ Pasamos la función al DisplayTable
      />
      <Dialog open={uploadOpen} onClose={() => handleUploadClose(false)} maxWidth="sm" fullWidth>
        <Box p={3}>
          <UploadFileWrapper onClose={handleUploadClose} uploadUrl={endpoints.uploadUrl} saveUrl={endpoints.saveUrl} listUrlForMutate={current.listUrl} />
        </Box>
      </Dialog>
    </>
  );
}