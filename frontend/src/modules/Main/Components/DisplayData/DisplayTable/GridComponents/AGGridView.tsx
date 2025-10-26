import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import type { ColDef } from 'ag-grid-community';
import type { Item } from '../../../../types/item';

interface Props {
  items: Item[];
  columnDefs: ColDef[];
}

const AGGridView: React.FC<Props> = ({ items, columnDefs }) => {
  const [rowData] = useState(items);

  const defaultColDef: ColDef = useMemo(
    () => ({
      resizable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: false,    // una sola barra de filtro (en header)
      sortable: true,
      suppressHeaderMenuButton: false,
    }),
    []
  );

  // Si algún día quieres retocar anchos por campo, hazlo aquí:
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

  return (
    <div style={{ height: 600, width: '100%', overflow: 'hidden' }} className="ag-theme-alpine">
      <AgGridReact
        rowData={rowData}
        columnDefs={adjustedColumnDefs}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        animateRows
      />
    </div>
  );
};

export default AGGridView;
