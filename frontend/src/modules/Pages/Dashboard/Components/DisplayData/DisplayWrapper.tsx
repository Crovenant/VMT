
// src/modules/Components/DisplayWrapper.tsx
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Title from '../Title/Title';
import FilterBar from './FilterBar';
import DisplayTable from './DisplayTable';
import useDisplayData from '../../hooks/useDisplayData';
import UploadFileWrapper from '../../../../Shared/Components/UploadFileWrapper';
import { useColumnMap } from './DisplayTable/hooks/useColumnMap';
import DeleteSelection from './DisplayTable/GridComponents/components/DeleteSelection';
import type { Item } from '../../../../Types/item';
type ViewType = 'VIT' | 'VUL';
const SCHEMA: Record<ViewType, { listUrl: string; uploadUrl: string; saveUrl: string; deleteUrl: string; updateUrl: string; defaultColumns: string[] }> = {
  VIT: {
    listUrl: 'http://localhost:8000/vit/risk-data/',
    uploadUrl: 'http://localhost:8000/vit/upload/',
    saveUrl: 'http://localhost:8000/vit/save-selection/',
    deleteUrl: 'http://localhost:8000/vit/delete-selection/',
    updateUrl: 'http://localhost:8000/vit/update-status/',
    defaultColumns: [
      'Número',
      'Estado',
      'Elemento de configuración',
      'Prioridad',
      'Asignado a',
      'Due date',
      'VUL',
    ],
  },
  VUL: {
    listUrl: 'http://localhost:8000/vul/risk-data/',
    uploadUrl: 'http://localhost:8000/vul/upload/',
    saveUrl: 'http://localhost:8000/vul/save-selection/',
    deleteUrl: 'http://localhost:8000/vul/delete-selection/',
    updateUrl: 'http://localhost:8000/vul/update-status/',
    defaultColumns: [
      'Número',
      'Activo',
      'Asignado a',
      'Prioridad',
      'Estado',
      'Actualizado',
      'VITS',
    ],
  },
};
const LS_VIEW = 'displayData.viewType';
const LS_COLS = (v: ViewType) => `displayData.visibleColumns.${v}`;
interface Props {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null | undefined;
  onResetView?: () => void;
  setShowUploadModal?: (val: boolean) => void;
  hideToggle?: boolean;
  onOpenModal: (item: Item) => void;
}
export default function DisplayWrapper({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  onResetView,
  setShowUploadModal,
  hideToggle = false,
  onOpenModal,
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
      } catch {}
    }
    setVisibleColumns(SCHEMA[viewType].defaultColumns);
  }, [viewType, allowedColumns]);
  useEffect(() => {
    const allowed = new Set(allowedColumns);
    const filtered = visibleColumns.filter((c) => allowed.has(String(c)));
    localStorage.setItem(LS_COLS(viewType), JSON.stringify(filtered.length ? filtered : SCHEMA[viewType].defaultColumns));
  }, [viewType, visibleColumns, allowedColumns]);
  const handleUploadClick = () => {
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleDeleteClick = () => {
    if (selectedCount === 0) return;
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(schema.deleteUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!response.ok) {
        await response.text();
        return;
      }
      await response.json();
      onResetView?.();
    } catch {} finally {
      setDeleteOpen(false);
      setSelectedCount(0);
      setSelectedIds([]);
    }
  };
  const handleCancelDelete = () => {
    setDeleteOpen(false);
  };
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
            onUpload={handleUploadClick}
            onDelete={handleDeleteClick}
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
        hasLink={(item: Item) => Boolean(item.hasLink)}
        onOpenModal={onOpenModal}
        setSelectedCount={setSelectedCount}
        setSelectedIds={setSelectedIds}
        updateUrl={current.updateUrl}
      />
      <Dialog open={uploadOpen} onClose={() => handleUploadClose(false)} maxWidth="sm" fullWidth>
        <Box p={3}>
          <UploadFileWrapper
            onClose={handleUploadClose}
            uploadUrl={current.uploadUrl}
            saveUrl={current.saveUrl}
            listUrlForMutate={current.listUrl}
          />
        </Box>
      </Dialog>
      <DeleteSelection
        open={deleteOpen}
        selectedCount={selectedCount}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
