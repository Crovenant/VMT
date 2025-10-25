import { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box, IconButton } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccordionDetail from './DisplayTable/Renderers/AccordionDetail';
import type { Item } from '../../types/item';
import type { ColDef, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const columnKeyMap: Record<string, keyof Item> = {
  "Número": "numero",
  "ID externo": "idExterno",
  "Estado": "estado",
  "Resumen": "resumen",
  "Breve descripción": "breveDescripcion",
  "Elemento de configuración": "elementoConfiguracion",
  "Prioridad": "prioridad",
  "Puntuación de riesgo": "puntuacionRiesgo",
  "Grupo de asignación": "grupoAsignacion",
  "Asignado a": "asignadoA",
  "Creado": "creado",
  "Actualizado": "actualizado",
  "Sites": "sites",
  "Vulnerability solution": "vulnerabilitySolution",
  "Vulnerabilidad": "vulnerabilidad"
};

const normalize = (v: unknown) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const getWarningColor = (priority: unknown) => {
  switch (normalize(priority)) {
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

export default function DisplayTable({
  rows,
  visibleColumns,
  showFilterPanel,
}: {
  rows: Item[];
  visibleColumns: string[];
  showFilterPanel: boolean;
}) {
  const gridRef = useRef<AgGridReact<Item>>(null);

  // Activar el acordeón en la primera fila si no tiene datos
  if (rows.length > 0 && !rows[0].comentarios && !rows[0].logHistory) {
    rows[0].comentarios = 'Comentarios de prueba';
    rows[0].logHistory = 'Historial de prueba';
  }

  const defaultColDef: ColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    wrapText: true,
    autoHeight: true,
    headerClass: 'ag-center-cols-header custom-header',
    cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
    suppressMenu: !showFilterPanel,
  }), [showFilterPanel]);

  const selectionColumnDef: ColDef = useMemo(() => ({
    headerCheckboxSelection: true,
    checkboxSelection: true,
    width: 30,
    suppressMovable: true,
  }), []);

  const eyeColumnDef: ColDef = useMemo(() => ({
    headerName: '',
    field: 'eyeIcon',
    suppressMovable: true,
    cellRenderer: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1976d2">
          <path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>
        </svg>
      </Box>
    ),
  }), []);

  const columnDefs: ColDef[] = useMemo(() => {
    const defs: ColDef[] = [];

    defs.push(selectionColumnDef);
    defs.push(eyeColumnDef);

    visibleColumns.forEach((col) => {
      const key = columnKeyMap[col];

      const baseDef: ColDef = {
        headerName: col,
        field: key,
        filter: true,
        sortable: true,
        headerClass: 'ag-center-cols-header custom-header',
        cellClass: 'custom-cell',
      };

      if (key === 'prioridad') {
        baseDef.cellRenderer = (params: ICellRendererParams) => {
          const value = params.value;
          const color = getWarningColor(value);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon sx={{ color, fontSize: 18 }} />
              <span>{String(value ?? '')}</span>
            </Box>
          );
        };
      }

      if (key === 'numero') {
        baseDef.cellRenderer = 'agGroupCellRenderer';
        baseDef.cellRendererParams = {
          suppressCount: true,
        };
      }

      defs.push(baseDef);
    });

    return defs;
  }, [visibleColumns]);

  const handleGridReady = (params: GridReadyEvent) => {
    const allColumnIds: string[] = [];
    const columns = params.columnApi.getColumns();
    if (columns) {
      columns.forEach((col: any) => {
        const colId = col.getColId?.();
        if (colId) allColumnIds.push(colId);
      });
      params.columnApi.autoSizeColumns(allColumnIds, false);
    }
  };

  return (
    <div className="ag-theme-quartz" style={{ height: '70vh', width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        rowMultiSelectWithClick={true}
        suppressRowClickSelection={false}
        animateRows={true}
        onGridReady={handleGridReady}
        getRowStyle={(params) => {
          return params.data?.followUp
            ? { backgroundColor: '#fff8e1' }
            : undefined;
        }}
        masterDetail={true}
        isRowMaster={(data) => !!data.comentarios || !!data.logHistory}
        detailCellRenderer={AccordionDetail}
        
        detailRowHeight={200}

      />
    </div>
  );
}