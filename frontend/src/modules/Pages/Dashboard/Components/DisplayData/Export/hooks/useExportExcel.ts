// src/modules/Pages/Dashboard/Components/DisplayData/Export/hooks/useExportExcel.ts
import { useEffect } from 'react'
import { exportVITToExcel, exportVULToExcel } from '../exportExcel'
import type { GridApi } from 'ag-grid-community'
import type { Item } from '../../../../../../Types/item'

export function useExportExcel(
  gridRef: React.RefObject<{ api: GridApi }>,
  rows: Item[],
  viewType: 'VIT' | 'VUL'
) {
  useEffect(() => {
    window.exportFilteredDataToExcel = () => {
      const api = gridRef.current?.api
      const selected = api?.getSelectedRows?.() ?? []
      const base = (selected as Item[]).length > 0 ? (selected as Item[]) : rows
      if (viewType === 'VUL') {
        exportVULToExcel(base)
      } else {
        exportVITToExcel(base)
      }
    }
  }, [gridRef, rows, viewType])
}
