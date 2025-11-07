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

type ViewType = 'Tshirt' | 'Soup';

const SCHEMA: Record<ViewType, { listUrl: string; uploadUrl: string; saveUrl: string; defaultColumns: string[] }> = {
  Tshirt: {
    listUrl: 'http://localhost:8000/risk-data/',
    uploadUrl: 'http://localhost:8000/upload_data/',
    saveUrl: 'http://localhost:8000/save_selection/',
    defaultColumns: [
      'Número','Estado','Resumen','Prioridad','Puntuación de riesgo','Asignado a','Creado','Actualizado','Due date',
    ],
  },
  Soup: {
    listUrl: 'http://localhost:8000/soup/risk-data/',
    uploadUrl: 'http://localhost:8000/soup/upload_data/',
    saveUrl: 'http://localhost:8000/soup/save_selection/',
    defaultColumns: [
      'Número','Estado','Resumen','Asignado a','Creado','Actualizado','Due date',
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
  setShowUploadModal: (val: boolean) => void; // ✅ Añadido
}

export default function DisplayWrapper({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  onResetView,
  setShowUploadModal, // ✅ Añadido
}: Props) {
  // Vista persistida
  const [viewType, _setViewType] = useState<ViewType>(() => {
    const saved = localStorage.getItem(LS_VIEW);
    return saved === 'Soup' || saved === 'Tshirt' ? (saved as ViewType) : 'Tshirt';
  });
  const setViewType = (v: ViewType) => {
    localStorage.setItem(LS_VIEW, v);
    _setViewType(v);
  };

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

  // === columnas visibles por vista, con VALIDACIÓN contra el "allowed set" ===
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const allowed = new Set(SCHEMA[viewType].defaultColumns);
    const saved = localStorage.getItem(LS_COLS(viewType));
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((c) => allowed.has(String(c)));
          if (filtered.length) return filtered;
        }
      } catch {}
    }
    return SCHEMA[viewType].defaultColumns;
  });

  // Al cambiar de vista: cargar y validar; si no cuadra, defaults de esa vista
  useEffect(() => {
    const allowed = new Set(SCHEMA[viewType].defaultColumns);
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
  }, [viewType]);

  // Guardar SIEMPRE filtrando (evita contaminar SOUP con columnas TSHIRT y viceversa)
  useEffect(() => {
    const allowed = new Set(SCHEMA[viewType].defaultColumns);
    const filtered = visibleColumns.filter((c) => allowed.has(String(c)));
    localStorage.setItem(
      LS_COLS(viewType),
      JSON.stringify(filtered.length ? filtered : SCHEMA[viewType].defaultColumns),
    );
  }, [viewType, visibleColumns]);

  // Abrir modal especificando a qué vista subimos
  const handleUploadByKind = (kind: ViewType) => {
    setUploadTarget(kind);
    setUploadOpen(true);
    setShowUploadModal(true); // ✅ Activamos modal externo si aplica
  };

  const handleUploadClose = (success: boolean) => {
    setUploadOpen(false);
    setShowUploadModal(false); // ✅ Cerramos modal externo
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
        setShowUploadModal={setShowUploadModal} // ✅ Prop pasada a DisplayTable
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