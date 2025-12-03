
import { useEffect, useState } from 'react';
import type { ColDef, ICellRendererParams, ValueGetterParams, IHeaderParams } from 'ag-grid-community';
import type { GridRow, DisplayRow } from '../../hooks/useDisplayRows';
import type { Item } from '../../../../../../../Types/item';
import { Box, Select, MenuItem } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { isDetailRow } from '../../hooks/useDisplayRows';
import { getWarningColor } from '../../utils/getWarningColor';

const STATUS_OPTIONS = [
  'Abierto',
  'En investigacion',
  'Reunirse con SWF',
  'Revision con otro equipo',
  'Pendientes de recalificación de criticidad',
  'Pendiente de planificacion',
  'Esperando implementacion',
  'Resuelto',
  'Esperando certificacion',
  'Solucion temporal',
  'Certificada',
  'Falso positivo',
  'Aceptado el riesgo',
  'Informativa',
  'Cerrado',
];

function EstadoCellRenderer(params: ICellRendererParams<GridRow>) {
  const d = params.data as DisplayRow | undefined;
  if (!d || isDetailRow(d)) return null;
  const item = d as Item;
  const initial = String(params.value ?? '');
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(initial);
  const updateUrl = (params.context as any)?.updateUrl as string | undefined;

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setSelected(initial);
    setEditing(false);
  };

  const handleConfirm = async () => {
    const numero = String(item.numero ?? '');
    if (!numero || !updateUrl) {
      setEditing(false);
      return;
    }
    try {
      const res = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, estado: selected }),
      });
      if (!res.ok) {
        setEditing(false);
        return;
      }
      params.node?.setDataValue('estado', selected);
      setEditing(false);
    } catch {
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '0 6px',
          '&:hover .edit-icon': { opacity: 1, pointerEvents: 'auto' },
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {initial}
        </span>
        <Box
          className="edit-icon"
          sx={{
            position: 'absolute',
            top: '50%',
            right: 6,
            transform: 'translateY(-50%)',
            opacity: 0,
            cursor: 'pointer',
            pointerEvents: 'none',
            transition: 'opacity 160ms ease',
          }}
          onClick={handleEdit}
        >
          <EditIcon sx={{ fontSize: 14 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'left' }}>
      <Select
        value={STATUS_OPTIONS.includes(selected) ? selected : ''}
        onChange={(e) => setSelected(String(e.target.value))}
        size="small"
        displayEmpty
        variant="outlined"
        sx={{
          minWidth: `${Math.max(selected.length * 8 + 40, 110)}px`,
          fontSize: '13px',
          borderRadius: '8px',
          '& .MuiSelect-select': {
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingLeft: '8px',
            paddingRight: '8px',
            lineHeight: 1.6,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cdd3e8',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9fb0e0',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7a91d9',
          },
          backgroundColor: '#fbfeff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #cfd8ea',
            },
          },
          MenuListProps: {
            sx: {
              paddingY: 0.5,
              '& .MuiMenuItem-root': {
                fontSize: '13px',
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '12px',
                paddingRight: '12px',
              },
              '& .MuiMenuItem-root:hover': {
                backgroundColor: '#f3f6ff',
              },
              '& .Mui-selected': {
                backgroundColor: '#e9f0ff !important',
              },
            },
          },
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleCancel();
          if (e.key === 'Enter') handleConfirm();
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ cursor: 'pointer', color: '#2e7d32' }} onClick={handleConfirm}>
          <CheckIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ cursor: 'pointer', color: '#d32f2f' }} onClick={handleCancel}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>
    </Box>
  );
}

function EstadoHeaderComponent(props: IHeaderParams) {
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    const api = props.api;
    const model = api.getFilterModel();
    model['estado'] = { type: 'notContains', filter: 'Resuelto' };
    api.setFilterModel(model);
  }, []);

  const toggleLock = () => {
    const api = props.api;
    const model = api.getFilterModel();
    if (locked) {
      delete model['estado'];
    } else {
      model['estado'] = { type: 'notContains', filter: 'Resuelto' };
    }
    api.setFilterModel(model);
    setLocked(!locked);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span>{props.displayName}</span>
      <Box sx={{ marginLeft: '6px', marginRight: '6px', cursor: 'pointer' }} onClick={toggleLock}>
        {locked ? (
          <LockIcon sx={{ fontSize: 16, color: '#b0b0b0' }} />
        ) : (
          <LockOpenIcon sx={{ fontSize: 16, color: '#757575' }} />
        )}
      </Box>
      <Box sx={{ cursor: 'pointer' }} onClick={(e) => props.showColumnMenu(e.currentTarget as HTMLElement)}>
        <span className="ag-header-icon ag-header-cell-menu-button">☰</span>
      </Box>
    </Box>
  );
}

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

    if (key === 'estado') {
      Object.assign(baseDef, { minWidth: 190, suppressMenu: true }, noWrap);
      baseDef.cellRenderer = EstadoCellRenderer;
      (baseDef as any).headerComponent = EstadoHeaderComponent;
    }

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

export { EstadoHeaderComponent };
