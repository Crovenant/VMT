import { useMemo, useRef, useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box } from '@mui/material';
import SideFilterPanel from './DisplayTable/GridComponents/SideFilterPanel';
import type { Item } from '../../../../Types/item';
import type { ColDef, IsFullWidthRowParams, ICellRendererParams } from 'ag-grid-community';
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
import DetailModal from '../DisplayData/Widgets/DetailModal';
import FullWidthRenderer from './DisplayTable/Renderers/FullWidthRenderer';

/* ===== tipos ===== */
type ViewType = 'Tshirt' | 'Soup';

export default function DisplayTable({
  rows,
  visibleColumns,
  setVisibleColumns,
  showFilterPanel,
  viewType,
}: {
  rows: Item[];
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  showFilterPanel: boolean;
  viewType: ViewType;
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

  useExportExcel(gridRef, rows, visibleColumns);
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
    [showFilterPanel],
  );

  const toggleColDef = useMemo(() => createToggleColDef(expanded, toggleExpand), [expanded, toggleExpand]);
  const businessColDefs = useMemo(() => createBusinessColDefs(visibleColumns, columnKeyMap), [visibleColumns, columnKeyMap]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const handleOpenModal = (item: Item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
  };

  const eyeColDef = useMemo(() => createEyeColDef(handleOpenModal), [handleOpenModal]);
  const columnDefs: ColDef<GridRow>[] = useMemo(
    () => [selectionColDef, eyeColDef, toggleColDef, ...businessColDefs],
    [selectionColDef, eyeColDef, toggleColDef, businessColDefs],
  );

  return (
    <>
      <Box sx={{ display: 'flex', height: '70vh', width: '100%', backgroundColor: '#f5f6f8', border: '1px solid rgba(31, 45, 90, 0.25)', borderRadius: '15px 0 0 15px', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, position: 'relative' }} className="ag-theme-quartz custom-ag">
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
            fullWidthCellRenderer={(p: ICellRendererParams<GridRow>) => <FullWidthRenderer params={p} itemById={itemById} />}
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
        </Box>

        <SideFilterPanel allHeaders={allColumns} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
      </Box>

      <DetailModal open={openModal} onClose={handleCloseModal} item={selectedItem} />
    </>
  );
}