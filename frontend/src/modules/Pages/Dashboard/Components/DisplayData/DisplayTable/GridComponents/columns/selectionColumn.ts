import type { ColDef, CheckboxSelectionCallbackParams } from 'ag-grid-community';
import type { GridRow, DisplayRow } from '../../hooks/useDisplayRows';
import { isDetailRow } from '../../hooks/useDisplayRows';

export const selectionColDef: ColDef<GridRow> = {
  headerName: '',
  field: '__sel__',
  headerCheckboxSelection: true,
  checkboxSelection: (p: CheckboxSelectionCallbackParams<GridRow>) =>
    !isDetailRow(p?.data as DisplayRow),
  width: 42,
  minWidth: 42,
  maxWidth: 42,
  suppressSizeToFit: true,
  resizable: false,
  suppressMenu: true,
  filter: false,
  sortable: false,
};