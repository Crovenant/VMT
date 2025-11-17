// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/GridComponents/hooks/useGridUtils.ts
import { useCallback } from 'react';
import type { GridApi, GridReadyEvent, FirstDataRenderedEvent, Column } from 'ag-grid-community';
import type { GridRow } from '../../hooks/useDisplayRows';

export function useGridUtils() {
  // Ajusta el ancho de columnas
  const tightenColumns = useCallback((api: GridApi<GridRow>) => {
    const ids = (api.getColumns() as Column[] | null | undefined)?.map((c) => c.getColId()) ?? [];
    api.autoSizeColumns(ids, false);

    const set = (id: string, w: number) => api.setColumnWidth(id, w, false);
    set('__sel__', 42);
    set('__eye__', 42);
    set('__toggle__', 42);
  }, []);

  // Evento al inicializar el grid
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    tightenColumns(params.api as GridApi<GridRow>);
    window.clearAllFilters = () => {
      params.api.setFilterModel(null);
      params.api.onFilterChanged();
    };
  }, [tightenColumns]);

  // Evento al renderizar datos por primera vez
  const handleFirstDataRendered = useCallback((e: FirstDataRenderedEvent) => {
    tightenColumns(e.api as GridApi<GridRow>);
  }, [tightenColumns]);

  return { tightenColumns, handleGridReady, handleFirstDataRendered };
}
