// src/modules/Main/Components/DisplayData/DisplayTable.tsx
import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';

import type { Item } from '../../../../Types/item';
import type {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  GridApi,
  Column,
  FirstDataRenderedEvent,
  IsFullWidthRowParams,
  CheckboxSelectionCallbackParams,
  ValueGetterParams,
} from 'ag-grid-community';

import AccordionDetail from './DisplayTable/Renderers/AccordionDetail';
import { exportFilteredDataToExcel } from './Export/exportExcel';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

declare global {
  interface Window {
    exportFilteredDataToExcel: () => void;
  }
}

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */
type DetailRow = { _kind: 'detail'; parentId: string };
type DisplayRow = Item | DetailRow;

/**
 * Para que AG Grid permita `field: string` sin usar `any`,
 * tipamos la fila como objeto indexable.
 */
type GridRow = Record<string, unknown>;

const columnKeyMap: Record<string, keyof Item> = {
  'Número': 'numero',
  'ID externo': 'idExterno',
  'Estado': 'estado',
  'Resumen': 'resumen',
  'Breve descripción': 'breveDescripcion',
  'Elemento de configuración': 'elementoConfiguracion',
  'Prioridad': 'prioridad',
  'Puntuación de riesgo': 'puntuacionRiesgo',
  'Grupo de asignación': 'grupoAsignacion',
  'Asignado a': 'asignadoA',
  'Creado': 'creado',
  'Actualizado': 'actualizado',
  'Sites': 'sites',
  'Vulnerability solution': 'vulnerabilitySolution',
  'Vulnerabilidad': 'vulnerabilidad',
};

const norm = (v: unknown) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const getWarningColor = (priority: unknown) => {
  switch (norm(priority)) {
    case 'critico':
    case 'critica':
    case 'critical':
      return '#d32f2f';
    case 'alto':
    case 'alta':
    case 'high':
      return '#f57c00';
    case 'medio':
    case 'media':
    case 'medium':
      return '#fbc02d';
    case 'bajo':
    case 'baja':
    case 'low':
      return '#1976d2';
    default:
      return '#9e9e9e';
  }
};

function isDetailRow(r: DisplayRow | undefined): r is DetailRow {
  return !!r && (r as DetailRow)._kind === 'detail';
}

function getRowKey(r: DisplayRow): string {
  if (isDetailRow(r)) return `detail:${r.parentId}`;
  const it = r as Item;
  return String(it.id ?? it.numero);
}

function buildDisplayRows(items: Item[], expanded: Set<string>): DisplayRow[] {
  const out: DisplayRow[] = [];
  for (const it of items) {
    out.push(it);
    const pid = String(it.id ?? it.numero);
    if (expanded.has(pid)) out.push({ _kind: 'detail', parentId: pid });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
export default function DisplayTable({
  rows,
  visibleColumns,
  showFilterPanel,
}: {
  rows: Item[];
  visibleColumns: string[];
  showFilterPanel: boolean;
}) {
  const gridRef = useRef<AgGridReact<GridRow>>(null);

  const itemById = useMemo(() => {
    const m = new Map<string, Item>();
    for (const it of rows) m.set(String(it.id ?? it.numero), it);
    return m;
  }, [rows]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const displayRows = useMemo(() => buildDisplayRows(rows, expanded), [rows, expanded]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    window.exportFilteredDataToExcel = () => exportFilteredDataToExcel(rows, visibleColumns);
  }, [rows, visibleColumns]);

  /* ---------- defaultColDef ---------- */
  const defaultColDef: ColDef<GridRow> = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      wrapHeaderText: true,
      autoHeaderHeight: true,
      wrapText: false,
      autoHeight: true,
      headerClass: 'custom-header',
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
      suppressHeaderMenuButton: false,
      minWidth: 60,
    }),
    [showFilterPanel],
  );

  /* ---------- selección (checkbox) ---------- */
  const selectionColDef: ColDef<GridRow> = useMemo(
    () => ({
      headerName: '',
      field: '__sel__',
      headerCheckboxSelection: true,
      checkboxSelection: (p: CheckboxSelectionCallbackParams<GridRow>) =>
        !isDetailRow(p?.data as DisplayRow),
      width: 42,
      minWidth: 42,
      maxWidth: 42,
      suppressSizeToFit: true,
      resizable: false,
      suppressMenu: true,
      filter: false,
      sortable: false,
    }),
    [],
  );

  /* ---------- ojo ---------- */
  const eyeColDef: ColDef<GridRow> = useMemo(
    () => ({
      headerName: '',
      field: '__eye__',
      width: 42,
      minWidth: 42,
      maxWidth: 42,
      suppressSizeToFit: true,
      resizable: false,
      suppressMenu: true,
      filter: false,
      sortable: false,
      cellRenderer: (p: ICellRendererParams<GridRow>) => {
        const d = p.data as DisplayRow | undefined;
        if (!d || isDetailRow(d)) return null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1976d2" aria-hidden>
              <path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
            </svg>
          </Box>
        );
      },
    }),
    [],
  );

  /* ---------- toggle (flecha) ---------- */
  const toggleColDef: ColDef<GridRow> = useMemo(
    () => ({
      headerName: '',
      field: '__toggle__',
      width: 42,
      minWidth: 42,
      maxWidth: 42,
      suppressSizeToFit: true,
      resizable: false,
      suppressMenu: true,
      filter: false,
      sortable: false,
      cellRenderer: (p: ICellRendererParams<GridRow>) => {
        const d = p.data as DisplayRow | undefined;
        if (!d || isDetailRow(d)) return null;

        const id = String((d as Item).id ?? (d as Item).numero);
        const open = expanded.has(id);
        const Icon = open ? ExpandMore : ChevronRight;

        return (
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(id);
            }}
            title={open ? 'Contraer' : 'Expandir'}
          >
            <Icon fontSize="medium" sx={{ color: '#1976d2' }} />
          </Box>
        );
      },
    }),
    [expanded, toggleExpand],
  );

  /* ---------- columnas de negocio ---------- */
  const businessColDefs: ColDef<GridRow>[] = useMemo(() => {
    const defs: ColDef<GridRow>[] = [];

    visibleColumns.forEach((col) => {
      const key = columnKeyMap[col];

      const baseDef: ColDef<GridRow> = {
        headerName: col,
        field: key as unknown as string, // permitir string como clave
        filter: true,
        sortable: true,
        headerClass: 'custom-header',
        cellClass: 'custom-cell',
        valueGetter: (p: ValueGetterParams<GridRow>) => {
          const d = p.data as DisplayRow | undefined;
          if (!d || isDetailRow(d)) return null;
          const item = d as Item;
          return (item as Record<string, unknown>)[key] ?? null;
        },
      };

      const noWrap = { cellStyle: { whiteSpace: 'nowrap' as const } };

      if (key === 'numero') Object.assign(baseDef, { width: 110, minWidth: 100, maxWidth: 130 }, noWrap);
      if (key === 'estado') Object.assign(baseDef, { width: 120, minWidth: 100, maxWidth: 140 }, noWrap);
      if (key === 'prioridad') Object.assign(baseDef, { width: 120, minWidth: 110, maxWidth: 140 }, noWrap);
      if (key === 'puntuacionRiesgo') Object.assign(baseDef, { width: 150, minWidth: 120, maxWidth: 160 }, noWrap);
      if (key === 'asignadoA') Object.assign(baseDef, { width: 170, minWidth: 140, maxWidth: 220 }, noWrap);
      if (key === 'actualizado') Object.assign(baseDef, { width: 140, minWidth: 120, maxWidth: 160 }, noWrap);
      if (key === 'resumen') Object.assign(baseDef, { flex: 1, minWidth: 250 });

      if (key === 'prioridad') {
        baseDef.cellRenderer = (params: ICellRendererParams<GridRow>) => {
          const value = params.value as string | null;
          if (value == null) return null;
          const color = getWarningColor(value);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon sx={{ color, fontSize: 18 }} />
              <span>{String(value)}</span>
            </Box>
          );
        };
      }

      defs.push(baseDef);
    });

    return defs;
  }, [visibleColumns]);

  /* ---------- columnDefs finales ---------- */
  const columnDefs: ColDef<GridRow>[] = useMemo(
    () => [selectionColDef, eyeColDef, toggleColDef, ...businessColDefs],
    [selectionColDef, eyeColDef, toggleColDef, businessColDefs],
  );

  /* ---------- auto-anchos ---------- */
  const tightenColumns = useCallback((api: GridApi<GridRow>) => {
    const ids = (api.getColumns() as Column[] | null | undefined)?.map((c) => c.getColId()) ?? [];
    api.autoSizeColumns(ids, false);

    const set = (id: string, w: number) => api.setColumnWidth(id, w, false);
    set('__sel__', 42);
    set('__eye__', 42);
    set('__toggle__', 42);

    set('numero', 110);
    set('estado', 120);
    set('prioridad', 120);
    set('puntuacionRiesgo', 150);
    set('asignadoA', 170);
    set('actualizado', 140);
  }, []);

  const handleGridReady = (params: GridReadyEvent) => {
    tightenColumns(params.api as GridApi<GridRow>);
  };

  const handleFirstDataRendered = (e: FirstDataRenderedEvent) => {
    tightenColumns(e.api as GridApi<GridRow>);
  };

  return (
    <div className="ag-theme-quartz custom-ag" style={{ height: '70vh', width: '100%', overflow: 'hidden' }}>
      <AgGridReact<GridRow>
        ref={gridRef}
        rowData={displayRows}
        getRowId={(p) => getRowKey(p.data as DisplayRow)}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        rowMultiSelectWithClick
        suppressRowClickSelection={false}
        animateRows
        onGridReady={handleGridReady}
        onFirstDataRendered={handleFirstDataRendered}
        embedFullWidthRows={false}
        isFullWidthRow={(p: IsFullWidthRowParams<GridRow>) => isDetailRow(p.rowNode?.data as DisplayRow | undefined)}
        fullWidthCellRenderer={(p: ICellRendererParams<GridRow>) => {
          const d = p.data as DisplayRow | undefined;
          if (!isDetailRow(d)) return null;
          const parent = itemById.get(d.parentId);
          return (
            <div className="full-width-detail-wrapper">
              <AccordionDetail item={parent} />
            </div>
          );
        }}
        getRowHeight={(p) => (isDetailRow(p.data as DisplayRow) ? 300 : undefined)}
        getRowStyle={(p) =>
          isDetailRow(p.data as DisplayRow)
            ? { backgroundColor: '#f5f6f8' }
            : (p.data as DisplayRow as Item)?.['followUp' as keyof Item]
            ? { backgroundColor: '#fff8e1' }
            : undefined
        }
        isRowSelectable={(p) => !isDetailRow(p?.data as DisplayRow)}
      />
    </div>
  );
}
