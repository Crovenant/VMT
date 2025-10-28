import { useState } from 'react';
import useItems from '../../../Shared/hooks/useItems';
import type { Item } from '../../../Types/item';
import { exportFilteredDataToExcel } from '../Components/DisplayData/Export/exportExcel';

const STORAGE_KEY = 'displayData.visibleColumns';
const DEFAULT_VISIBLE_COLUMNS = [
  'Número',
  'Estado',
  'Resumen',
  'Prioridad',
  'Puntuación de riesgo',
  'Asignado a',
  'Actualizado',
];

export default function useDisplayData({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
}: {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null;
}) {
  const [visibleRows, setVisibleRows] = useState<number>(10);
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
    } catch (error) {
      console.error('Error leyendo columnas visibles:', error);
      return DEFAULT_VISIBLE_COLUMNS;
    }
  });

  const { items }: { items: Item[] } = useItems(refreshKey);

  const rows = selectedItemId
    ? items.filter((row: Item) => String(row.id) === selectedItemId)
    : priorityFilter
    ? items.filter(
        (row: Item) =>
          row.prioridad?.toLowerCase() === priorityFilter.toLowerCase()
      )
    : customFlagFilter === 'followUp'
    ? items.filter((row: Item) => row.followUp)
    : customFlagFilter === 'soonDue'
    ? items.filter((row: Item) => row.soonDue)
    : items;

  const handleDownload = () => {
    exportFilteredDataToExcel(rows, visibleColumns);
  };

  return {
    rows,
    visibleColumns,
    setVisibleColumns,
    visibleRows,
    setVisibleRows,
    showFilterPanel,
    setShowFilterPanel,
    handleDownload,
  };
}