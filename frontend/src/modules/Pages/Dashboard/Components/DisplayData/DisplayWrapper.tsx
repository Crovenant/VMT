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
// ⭐ Usamos el hook para conocer TODAS las columnas permitidas por vista
import { useColumnMap } from './DisplayTable/hooks/useColumnMap';

type ViewType = 'Csirt' | 'Cso';

const SCHEMA: Record<ViewType, { listUrl: string; uploadUrl: string; saveUrl: string; defaultColumns: string[] }> = {
  Csirt: {
    listUrl: 'http://localhost:8000/risk-data/',
    uploadUrl: 'http://localhost:8000/upload_data/',
    saveUrl: 'http://localhost:8000/save_selection/',
    defaultColumns: [
      'Número','Estado','Resumen','Prioridad','Puntuación de riesgo','Asignado a','Creado','Actualizado','Due date',
    ],
  },
  Cso: {
    listUrl: 'http://localhost:8000/Cso/risk-data/',
    uploadUrl: 'http://localhost:8000/Cso/upload_data/',
    saveUrl: 'http://localhost:8000/Cso/save_selection/',
    // Defaults mínimos para Cso
    defaultColumns: [
      'Vulnerability ID',
      'State',
      'Severity',
      'VUL Code',
      'VIT Code',
    ],
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
  // Vista persistida
  const [viewType, _setViewType] = useState<ViewType>(() => {
    const saved = localStorage.getItem(LS_VIEW);
    return saved === 'Cso' || saved === 'Csirt' ? (saved as ViewType) : 'Csirt';
  });
  const setViewType = (v: ViewType) => {
    localStorage.setItem(LS_VIEW, v);
    _setViewType(v);
  };

  // ⭐ Columnas permitidas (todas) según la vista
  const { allColumns: allowedColumns } = useColumnMap(viewType);

  // Modal de subida
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<ViewType>(viewType);
  useEffect(() => { setUploadTarget(viewType); }, [viewType]);

  // Datos
  const schema = SCHEMA[viewType];
  const { rows, showFilterPanel } = useDisplayData({
    refreshKey,
    priorityFilter,
    selectedItemId,
    customFlagFilter,
    viewType,
    listUrl: schema.listUrl,
  });

  // === columnas visibles por vista ===
  // Inicializa con defaults; la carga desde localStorage se hace en el efecto de abajo
  const [visibleColumns, setVisibleColumns] = useState<string[]>(SCHEMA[viewType].defaultColumns);

  // ⭐ Al cambiar de vista (o de set permitido): cargar de localStorage y VALIDAR contra TODAS las columnas permitidas
  useEffect(() => {
    const allowed = new Set(allowedColumns); // ← TODAS para esa vista
    const saved = localStorage.getItem(LS_COLS(viewType));
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((c) => allowed.has(String(c)));
          setVisibleColumns(filtered.length ? filtered : SCHEMA[viewType].defaultColumns);
          return;
        }
      } catch {}
    }
    setVisibleColumns(SCHEMA[viewType].defaultColumns);
  }, [viewType, allowedColumns]);

  // ⭐ Guardar SIEMPRE filtrando contra TODAS las columnas permitidas (no solo defaults)
  useEffect(() => {
    const allowed = new Set(allowedColumns);
    const filtered = visibleColumns.filter((c) => allowed.has(String(c)));
    localStorage.setItem(
      LS_COLS(viewType),
      JSON.stringify(filtered.length ? filtered : SCHEMA[viewType].defaultColumns),
    );
  }, [viewType, visibleColumns, allowedColumns]);

  // Abrir modal especificando a qué vista subimos
  const handleUploadByKind = (kind: ViewType) => {
    setUploadTarget(kind);
    setUploadOpen(true);
    setShowUploadModal?.(true);
  };

  const handleUploadClose = (success: boolean) => {
    setUploadOpen(false);
    setShowUploadModal?.(false);
    if (success) {
      if (uploadTarget !== viewType) setViewType(uploadTarget);
      onResetView?.();
    }
  };

  const endpoints = SCHEMA[uploadTarget];
  const current = SCHEMA[viewType];

  return (
    <>
      <Box display="grid" gridTemplateColumns="1fr auto auto" alignItems="center" columnGap={2} mb={0.5}>
        <Box><Title>{viewType.toUpperCase()} view</Title></Box>
        <Box display="flex" justifyContent="center">
          <LatchWidget viewType={viewType} onSwitchView={(v: ViewType) => setViewType(v)} />
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <FilterBar
            handleDownload={() => { if (typeof window.exportFilteredDataToExcel === 'function') window.exportFilteredDataToExcel(); }}
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
            listUrlForMutate={current.listUrl}
          />
        </Box>
      </Dialog>
    </>
  );
}
