import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import type { GridRow, DisplayRow } from '../../hooks/useDisplayRows';
import type { Item } from '../../../../../../../Types/item';
import { Box } from '@mui/material';

export const createEyeColDef = (
  handleOpenModal: (item: Item) => void,
  hasLink?: (item: Item) => boolean,
): ColDef<GridRow> => {
  return {
    headerName: '',
    field: '__eye__',
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
      if (!d) return null;

      const item = d as unknown as Item;

      if (hasLink && !hasLink(item)) {
        return null;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            cursor: 'pointer',
            paddingTop: '4px',
          }}
          onClick={() => handleOpenModal(item)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1976d2" aria-hidden="true">
            <path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
          </svg>
        </Box>
      );
    },
  };
};