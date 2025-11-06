import type { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import type { GridRow, DisplayRow } from '../../hooks/useDisplayRows';
import type { Item } from '../../../../../../../Types/item';
import { Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { isDetailRow } from '../../hooks/useDisplayRows';
import { getWarningColor } from '../../utils/getWarningColor';

export const createBusinessColDefs = (
  visibleColumns: string[],
  columnKeyMap: Record<string, string>
): ColDef<GridRow>[] => {
  const defs: ColDef<GridRow>[] = [];

  visibleColumns.forEach((col) => {
    const key = columnKeyMap[col];
    if (!key) return;

    const baseDef: ColDef<GridRow> = {
      headerName: col,
      field: key as unknown as string,
      filter: true,
      sortable: true,
      headerClass: 'custom-header',
      cellClass: 'custom-cell',
      valueGetter: (p: ValueGetterParams<GridRow>) => {
        const d = p.data as DisplayRow | undefined;
        if (!d || isDetailRow(d)) return null;
        const item = d as Item;
        return (item as Record<string, unknown>)[key] ?? null;
      },
    };

    const noWrap = { cellStyle: { whiteSpace: 'nowrap' as const } };

    if (key === 'numero') Object.assign(baseDef, { width: 110 }, noWrap);
    if (key === 'estado') Object.assign(baseDef, { width: 120 }, noWrap);

    if (key === 'prioridad') {
      Object.assign(baseDef, { width: 120 }, noWrap);
      baseDef.cellRenderer = (params: ICellRendererParams<GridRow>) => {
        const value = params.value as string | null;
        if (value == null) return null;
        const color = getWarningColor(value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon sx={{ color, fontSize: 18 }} />
            <span>{String(value)}</span>
          </Box>
        );
      };
    }

    defs.push(baseDef);
  });

  return defs;
};