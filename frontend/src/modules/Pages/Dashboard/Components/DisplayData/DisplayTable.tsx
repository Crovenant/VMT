
// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable.tsx
import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box } from '@mui/material';
import SideFilterPanel from './DisplayTable/GridComponents/components/SideFilterPanel';
import type { Item } from '../../../../Types/item';
import type {
  ColDef,
  IsFullWidthRowParams,
  ICellRendererParams,
  RowStyle,
  RowClassParams,
  ColumnMovedEvent,
  ColumnResizedEvent,
  ColumnState,
  GridApi,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useColumnMap } from './DisplayTable/hooks/useColumnMap';
import type { GridRow, DisplayRow } from './DisplayTable/hooks/useDisplayRows';
import { isDetailRow, getRowKey, buildDisplayRows } from './DisplayTable/hooks/useDisplayRows';
import { selectionColDef } from './DisplayTable/GridComponents/columns/selectionColumn';
import { createEyeColDef } from './DisplayTable/GridComponents/columns/eyeColumn';
import { createToggleColDef } from './DisplayTable/GridComponents/columns/toggleColumn';
import { createBusinessColDefs } from './DisplayTable/GridComponents/columns/businessColumns';
import { useExportExcel } from '../DisplayData/Export/hooks/useExportExcel';
import { useGridUtils } from './DisplayTable/GridComponents/hooks/useGridUtils';
import FullWidthRenderer from './DisplayTable/Renderers/FullWidthRenderer';

type ViewType = 'VIT' | 'VUL';
const LS_COLUMN_STATE = (v: ViewType) => `displayData.columnState.${v}`;

export default function DisplayTable({
  rows,
  visibleColumns,
  setVisibleColumns,
  viewType,
  hasLink,
  onOpenModal,
  setSelectedCount,
  setSelectedIds,
}: {
  rows: Item[];
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  showFilterPanel: boolean;
  viewType: ViewType;
  setShowUploadModal?: (val: boolean) => void;
  hasLink?: (item: Item) => boolean;
  onOpenModal: (item: Item) => void;
  setSelectedCount?: React.Dispatch<React.SetStateAction<number>>;
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const gridRef = useRef<AgGridReact<GridRow>>(null);

  const itemById = useMemo(() => {
    const m = new Map<string, Item>();
    for (const it of rows) m.set(String(it.id ?? it.numero), it);
    return m;
  }, [rows]);

  const { map: columnKeyMap, allColumns } = useColumnMap(viewType);

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

  useExportExcel(gridRef as unknown as React.RefObject<{ api: GridApi }>, rows, visibleColumns);
  const { handleGridReady, handleFirstDataRendered } = useGridUtils();

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
    [],
  );

  const toggleColDef = useMemo(() => createToggleColDef(expanded, toggleExpand), [expanded, toggleExpand]);
  const businessColDefs = useMemo(() => createBusinessColDefs(visibleColumns, columnKeyMap), [visibleColumns, columnKeyMap]);
  const eyeColDef = useMemo(() => createEyeColDef((item: Item) => onOpenModal(item), hasLink), [onOpenModal, hasLink]);

  const columnDefs: ColDef<GridRow>[] = useMemo(
    () => [selectionColDef, eyeColDef, toggleColDef, ...businessColDefs],
    [eyeColDef, toggleColDef, businessColDefs],
  );

  const getRowStyle = useCallback(
    (p: RowClassParams<GridRow, unknown>): RowStyle | undefined => {
      const data = p?.data as DisplayRow | undefined;
      if (isDetailRow(data)) {
        const st: RowStyle = {};
        st.backgroundColor = '#f5f6f8';
        return st;
      }
      const it = (data as Item) ?? ({} as Item);
      if (it.prioridad === 'Crítico' || it.followUp) {
        const st: RowStyle = {};
        st.backgroundColor = '#fff8e1';
        return st;
      }
      return undefined;
    },
    [],
  );

  const persistColumnState = useCallback(() => {
    const colApi = gridRef.current?.columnApi;
    if (!colApi) return;
    const state = colApi.getColumnState() as ColumnState[];
    localStorage.setItem(LS_COLUMN_STATE(viewType), JSON.stringify(state));
  }, [viewType]);

  const applySavedColumnState = useCallback(() => {
    const colApi = gridRef.current?.columnApi;
    if (!colApi) return;
    const raw = localStorage.getItem(LS_COLUMN_STATE(viewType));
    if (!raw) return;
    try {
      const state: unknown = JSON.parse(raw);
      if (Array.isArray(state)) {
        colApi.applyColumnState({ state: state as ColumnState[], applyOrder: true });
      }
    } catch {
      console.error('Error applying saved column state');
    }
  }, [viewType]);

  useEffect(() => {
    const t = setTimeout(() => applySavedColumnState(), 0);
    return () => clearTimeout(t);
  }, [applySavedColumnState, columnDefs]);

  const onColumnMoved = useCallback((e: ColumnMovedEvent) => {
    if (e.finished) persistColumnState();
  }, [persistColumnState]);

  const onColumnResized = useCallback((e: ColumnResizedEvent) => {
    if (e.finished) persistColumnState();
  }, [persistColumnState]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height: '70vh',
          width: '100%',
          backgroundColor: '#f5f6f8',
          border: '1px solid rgba(31, 45, 90, 0.25)',
          borderRadius: '15px 0 0 15px',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flex: 1, position: 'relative' }} className="ag-theme-quartz custom-ag">
          <AgGridReact<GridRow>
            ref={gridRef}
            rowData={displayRows}
            getRowId={(p) => getRowKey(p.data as DisplayRow)}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowSelection="multiple"
            rowMultiSelectWithClick
            suppressRowClickSelection={true}
            animateRows
            onGridReady={handleGridReady}
            onFirstDataRendered={handleFirstDataRendered}
            embedFullWidthRows={false}
            isFullWidthRow={(p: IsFullWidthRowParams<GridRow>) =>
              isDetailRow(p.rowNode?.data as DisplayRow | undefined)
            }
            fullWidthCellRenderer={(p: ICellRendererParams<GridRow>) => (
              <FullWidthRenderer params={p} itemById={itemById} />
            )}
            getRowHeight={(p) => (isDetailRow(p.data as DisplayRow) ? 300 : undefined)}
            getRowStyle={getRowStyle}
            isRowSelectable={(p) => !isDetailRow(p?.data as DisplayRow)}
            onColumnMoved={onColumnMoved}
            onColumnResized={onColumnResized}
            onSelectionChanged={(params) => {
              const selectedRows = params.api.getSelectedRows();
              if (setSelectedCount) setSelectedCount(selectedRows.length);
              if (setSelectedIds) {
                const ids = selectedRows.map((r: any) => String(r.id ?? r.numero));
                setSelectedIds(ids);
              }
            }}
          />
        </Box>
        <SideFilterPanel
          allHeaders={allColumns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
      </Box>
    </>
  );
}
