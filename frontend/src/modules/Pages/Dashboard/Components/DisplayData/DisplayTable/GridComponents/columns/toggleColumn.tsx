import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import type { GridRow, DisplayRow } from '../../hooks/useDisplayRows';
import type { Item } from '../../../../../../../Types/item';
import { Box } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { isDetailRow } from '../../hooks/useDisplayRows';

export const createToggleColDef = (
  expanded: Set<string>,
  toggleExpand: (id: string) => void
): ColDef<GridRow> => {
  return {
    headerName: '',
    field: '__toggle__',
    width: 42,
    minWidth: 42,
    maxWidth: 42,
    suppressSizeToFit: true,
    resizable: false,
    suppressMenu: true,
    filter: false,
    sortable: false,
    cellRenderer: (p: ICellRendererParams<GridRow>) => {
      const d = p.data as DisplayRow | undefined;
      if (!d || isDetailRow(d)) return null;
      const id = String((d as Item).id ?? (d as Item).numero);
      const open = expanded.has(id);
      const Icon = open ? ExpandMore : ChevronRight;

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            cursor: 'pointer',
            marginTop: '6px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(id);
          }}
          title={open ? 'Contraer' : 'Expandir'}
        >
          <Icon fontSize="medium" sx={{ color: '#1976d2' }} />
        </Box>
      );
    },
  };
};