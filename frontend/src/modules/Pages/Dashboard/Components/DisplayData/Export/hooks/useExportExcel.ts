import { useEffect } from 'react';
import * as ExcelExport from '../exportExcel';
import type { GridApi } from 'ag-grid-community';
import type { Item } from '../../../../../../Types/item';

export function useExportExcel(
  gridRef: React.RefObject<{ api: GridApi }>,
  rows: Item[],
  visibleColumns: string[]
) {
  useEffect(() => {
    window.exportFilteredDataToExcel = () => {
      const api = gridRef.current?.api;
      const selected = api?.getSelectedRows() ?? [];
      const dataToExport = selected.length > 0 ? selected : rows;

      const expFn =
        (ExcelExport as any).exportFilteredDataToExcel ||
        (ExcelExport as any).exportFullJsonToExcel ||
        (ExcelExport as any).exportToExcel ||
        (ExcelExport as any).default;

      if (typeof expFn === 'function') {
        expFn(dataToExport, visibleColumns);
      }
    };
  }, [gridRef, rows, visibleColumns]);
}