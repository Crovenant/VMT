
import React, { useMemo, useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import type { ColDef, RowHeightParams } from 'ag-grid-community';
import type { Item } from '../../../../../../../Types/item';
import FullWidthRenderer from '../../Renderers/FullWidthRenderer';
import { isDetailRow } from '../../hooks/useDisplayRows';

type ViewType = 'VIT' | 'VUL';

interface Props {
  items: Item[];
  columnDefs: ColDef[];
  itemById: Map<string, Item>;
  viewType: ViewType;
}

const AGGridView: React.FC<Props> = ({ items, columnDefs, itemById, viewType }) => {
  const [rowData] = useState(items);

  const defaultColDef: ColDef = useMemo(
    () => ({
      resizable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      suppressHeaderMenuButton: false,
    }),
    []
  );

  const adjustedColumnDefs = useMemo<ColDef[]>(
    () =>
      columnDefs.map((col) => {
        switch (col.field) {
          case 'numero':
            return { ...col, width: 100 };
          case 'estado':
            return { ...col, width: 120 };
          case 'resumen':
            return { ...col, width: 250 };
          case 'prioridad':
            return { ...col, width: 120 };
          case 'puntuacionRiesgo':
            return { ...col, width: 160 };
          case 'asignadoA':
            return { ...col, width: 180 };
          case 'actualizado':
            return { ...col, width: 130 };
          default:
            return col;
        }
      }),
    [columnDefs]
  );

  const getRowHeight = useCallback((params: RowHeightParams) => {
    if (isDetailRow(params.data)) {
      return 220;
    }
    return 40;
  }, []);

  const isFullWidthRow = useCallback((params: any) => {
    return isDetailRow(params.data);
  }, []);

  return (
    <div
      style={{ height: 600, width: '100%', overflow: 'hidden' }}
      className="ag-theme-alpine custom-ag-theme custom-ag"
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={adjustedColumnDefs}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        animateRows
        isFullWidthRow={isFullWidthRow}
        getRowHeight={getRowHeight}
        components={{
          fullWidthRenderer: (props: any) => (
            <FullWidthRenderer params={props} itemById={itemById} viewType={viewType} />
          ),
        }}
        fullWidthCellRenderer="fullWidthRenderer"
      />
    </div>
  );
};

export default AGGridView;
