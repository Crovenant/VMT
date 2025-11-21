// src/modules/Pages/Dashboard/Components/DisplayData/Export/hooks/useExportExcel.ts
import { useEffect } from 'react';
import { exportVITToExcel, exportVULToExcel } from '../exportExcel';
import type { GridApi } from 'ag-grid-community';
import type { Item } from '../../../../../../Types/item';

function isVULItem(item: Item): boolean {
  return !!item.vits || !!item.elementosVulnerables || !!item.activo;
}

export function useExportExcel(
  gridRef: React.RefObject<{ api: GridApi }>,
  rows: Item[],
  visibleColumns: string[]
) {
  useEffect(() => {
    window.exportFilteredDataToExcel = () => {
      const api = gridRef.current?.api;
      const selected = api?.getSelectedRows?.() ?? [];
      const base = (selected as Item[]).length > 0 ? (selected as Item[]) : rows;

      const isVULView = visibleColumns.includes('Activo') || visibleColumns.includes('Elementos vulnerables');

      if (isVULView) {
        exportVULToExcel(base.filter(isVULItem));
      } else {
        exportVITToExcel(base.filter((item) => !isVULItem(item)));
      }
    };
  }, [gridRef, rows, visibleColumns]);
}