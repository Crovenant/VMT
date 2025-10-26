import { useState } from 'react';
import useItems from './useItems';
import type { Item } from '../types/item';
import * as XLSX from 'xlsx';

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
  selectedItemId?: string | null; // ← corregido aquí
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
    ? items.filter((row: Item) => String(row.id) === selectedItemId) // ← comparación corregida
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
    const allKeys = Array.from(
      rows.reduce((acc: Set<string>, row: Item) => {
        Object.keys(row).forEach((key) => acc.add(key));
        return acc;
      }, new Set<string>())
    );

    const dataToExport = rows.map((row: Item) => {
      const fullRow: Record<string, string> = {};
      allKeys.forEach((key) => {
        const value = row[key as keyof Item];
        fullRow[key] = typeof value === 'string' ? value : String(value ?? '');
      });
      return fullRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vulnerability list');

    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? '');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: 'center' },
        };
      }
    }

    XLSX.writeFile(workbook, 'vulnerability_list_export.xlsx');
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