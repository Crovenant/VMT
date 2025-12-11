
// src/modules/Pages/Dashboard/Components/DisplayData/Export/hooks/useExportExcel.ts
import { useEffect } from 'react';
import { exportVITToExcel, exportVULToExcel } from '../exportExcel';
import type { GridApi } from 'ag-grid-community';
import type { Item } from '../../../../../../Types/item';

function collectVisibleRows(api?: GridApi | null): Item[] {
  const out: Item[] = [];
  if (!api) return out;
  api.forEachNodeAfterFilterAndSort((node) => {
    const data = node?.data as Item | undefined;
    if (data) out.push(data);
  });
  return out;
}

export function useExportExcel(
  gridRef: React.RefObject<{ api: GridApi }>,
  rows: Item[],
  visibleColumns: string[]
) {
  useEffect(() => {
    window.exportFilteredDataToExcel = () => {
      const api = gridRef.current?.api ?? null;

      const selected = api?.getSelectedRows?.() ?? [];
      const base =
        (selected as Item[]).length > 0
          ? (selected as Item[])
          : collectVisibleRows(api).length > 0
          ? collectVisibleRows(api)
          : rows;

      const isVULView =
        visibleColumns.includes('Activo') || visibleColumns.includes('Elementos vulnerables');

      if (isVULView) {
        // Exporta tal cual lo visible/seleccionado en VUL
        exportVULToExcel(base);
      } else {
        // Exporta tal cual lo visible/seleccionado en VIT
        exportVITToExcel(base);
      }
    };
  }, [gridRef, rows, visibleColumns]);
}
