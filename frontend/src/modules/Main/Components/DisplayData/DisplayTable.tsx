// modules/components/DisplayTable.tsx
import { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { Item } from '../../types/item';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
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
}: {
  rows: Item[];
  visibleColumns: string[];
  showFilterPanel: boolean;
}) {
  const gridRef = useRef<AgGridReact<Item>>(null);

  const defaultColDef: ColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    wrapText: true,
    autoHeight: true,
    headerClass: 'ag-center-cols-header',
    cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
  }), []);

  const columnDefs: ColDef[] = useMemo(() => {
    return visibleColumns.map((col): ColDef => {
      const key = columnKeyMap[col];

      if (key === 'prioridad') {
        return {
          headerName: col,
          field: key,
          filter: true,
          sortable: true,
          headerClass: 'ag-center-cols-header',
          cellRenderer: (params: any) => {
            const value = params.value;
            const color = getWarningColor(value);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon sx={{ color, fontSize: 18 }} />
                <span>{String(value ?? '')}</span>
              </Box>
            );
          }
        };
      }

      return {
        headerName: col,
        field: key,
        filter: true,
        sortable: true,
        headerClass: 'ag-center-cols-header',
      };
    });
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
        suppressRowClickSelection={false}
        animateRows={true}
        onGridReady={handleGridReady}
        getRowStyle={(params) => {
          return params.data?.followUp
            ? { backgroundColor: '#fff8e1' }
            : undefined;
        }}
      />
    </div>
  );
}