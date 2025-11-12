// src/modules/Pages/Dashboard/Components/DisplayData/Export/hooks/useExportExcel.ts
import { useEffect } from 'react';
import * as ExcelExport from '../exportExcel';
import type { GridApi } from 'ag-grid-community';
import type { Item } from '../../../../../../Types/item';

type ExportFn = (rows: Item[], visibleColumns: string[]) => void;
type ExportModule = {
  exportFilteredDataToExcel?: ExportFn;
  exportFullJsonToExcel?: ExportFn;
  exportToExcel?: ExportFn;
  default?: ExportFn;
};

export function useExportExcel(
  gridRef: React.RefObject<{ api: GridApi }>,
  rows: Item[],
  visibleColumns: string[]
) {
  useEffect(() => {
    const mod = ExcelExport as unknown as ExportModule;

    window.exportFilteredDataToExcel = () => {
      const api = gridRef.current?.api;
      const selected = api?.getSelectedRows?.() ?? [];
      const dataToExport = (selected as Item[]).length > 0 ? (selected as Item[]) : rows;

      const expFn: ExportFn | undefined =
        mod.exportFilteredDataToExcel ||
        mod.exportFullJsonToExcel ||
        mod.exportToExcel ||
        mod.default;

      if (typeof expFn === 'function') {
        expFn(dataToExport, visibleColumns);
      }
    };
  }, [gridRef, rows, visibleColumns]);
}
