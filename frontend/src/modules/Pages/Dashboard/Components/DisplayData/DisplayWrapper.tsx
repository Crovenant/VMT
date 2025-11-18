// src/modules/Pages/Dashboard/Components/DisplayData/DisplayWrapper.tsx
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
}

export default function DisplayWrapper({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  onResetView,
  setShowUploadModal,
  hideToggle = false,
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
  const [linkedCodes, setLinkedCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const fetchLinks = async () => {
      try {
        const [vitRes, vulRes] = await Promise.all([fetch(SCHEMA.VIT.listUrl), fetch(SCHEMA.VUL.listUrl)]);
        if (!vitRes.ok || !vulRes.ok) {
          throw new Error(`HTTP ${vitRes.status} / ${vulRes.status}`);
        }
        const vitRaw: unknown = await vitRes.json();
        const vulRaw: unknown = await vulRes.json();
        const vitNums = new Set<string>();
        if (Array.isArray(vitRaw)) {
          (vitRaw as Record<string, unknown>[]).forEach((r) => {
            const n = r.numero ?? r['numero'] ?? r['Número'];
            if (n !== undefined && n !== null && String(n).trim() !== '') {
              vitNums.add(String(n).trim());
            }
          });
        }
        const vulVitCodes = new Set<string>();
        if (Array.isArray(vulRaw)) {
          (vulRaw as Record<string, unknown>[]).forEach((r) => {
            const v = r.vitCode ?? r['VIT Code'] ?? r['Vit Code'];
            if (v !== undefined && v !== null && String(v).trim() !== '') {
              vulVitCodes.add(String(v).trim());
            }
            // También considerar campo VITS (lista de códigos)
            const vitsField = r.VITS ?? r['VITS'] ?? r['vits'];
            if (typeof vitsField === 'string') {
              vitsField.split(',').map((code) => code.trim()).forEach((code) => {
                if (code) vulVitCodes.add(code);
              });
            } else if (Array.isArray(vitsField)) {
              (vitsField as unknown[]).map((code) => String(code).trim()).forEach((code) => {
                if (code) vulVitCodes.add(code);
              });
            }
          });
        }
        const linked = new Set<string>();
        vulVitCodes.forEach((code) => {
          if (vitNums.has(code)) linked.add(code);
        });
        if (!cancelled) {
          setLinkedCodes(linked);
        }
      } catch (err) {
        console.error('Error calculating linked VIT/VUL codes:', err);
        if (!cancelled) setLinkedCodes(new Set());
      }
    };
    void fetchLinks();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const hasLink = useCallback(
    (item: Item): boolean => {
      if (!linkedCodes || linkedCodes.size === 0) return true;
      if (viewType === 'VIT') {
        const code = String(item.numero ?? '').trim();
        return code !== '' && linkedCodes.has(code);
      }
      // Vista VUL: buscar en VITS
      const vitsField = (item as Record<string, unknown>).VITS ?? (item as Record<string, unknown>)['vits'];
      if (typeof vitsField === 'string') {
        return vitsField.split(',').some((code) => linkedCodes.has(code.trim()));
      } else if (Array.isArray(vitsField)) {
        return (vitsField as unknown[]).some((code) => linkedCodes.has(String(code).trim()));
      }
      return false;
    },
    [linkedCodes, viewType],
  );

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
      />
      <Dialog open={uploadOpen} onClose={() => handleUploadClose(false)} maxWidth="sm" fullWidth>
        <Box p={3}>
          <UploadFileWrapper onClose={handleUploadClose} uploadUrl={endpoints.uploadUrl} saveUrl={endpoints.saveUrl} listUrlForMutate={current.listUrl} />
        </Box>
      </Dialog>
    </>
  );
}
