// src/modules/Pages/Dashboard/Components/DisplayData/Widgets/DetailModal.tsx
import { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Grid,
  Typography,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';

import type { Item } from '../../../../../Types/item';
import { CSIRT_MAP, CSO_MAP } from '../DisplayTable/constants/columnMaps';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

type Props = {
  open: boolean;
  onClose: () => void;
  item: Item | null;
};

export default function DetailModal({ open, onClose, item }: Props) {
  // Columnas Cso (estructura, sin datos aún)
  const CsoColumnDefs = useMemo<ColDef[]>(
    () =>
      Object.keys(CSO_MAP).map((header) => ({
        headerName: header,
        field: header, // datos vendrán después; ahora solo estructura
        resizable: true,
        sortable: true,
        filter: 'agTextColumnFilter',
        minWidth: 120,
        wrapHeaderText: true,
        autoHeaderHeight: true,
      })),
    [],
  );

  const relatedRows: Record<string, unknown>[] = useMemo(() => [], []);

  // Pares etiqueta/valor para TODOS los campos Csirt (en orden de CSIRT_MAP)
  const CsirtPairs = useMemo(() => {
    if (!item) return [];
    return Object.entries(CSIRT_MAP).map(([label, key]) => {
      const value = (item as any)[key];
      return { label, value: value ?? '' };
    });
  }, [item]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Csirt item.
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: '#fafbfc' }}>
        {/* Bloque de campos Csirt */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1.5}>
            {CsirtPairs.map(({ label, value }) => (
              <Grid key={label} item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {label}:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {String(value)}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Subtítulo sección Cso */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            mb: 1.5,
          }}
        >
          Cso items.
        </Typography>

        {/* Grid de componentes relacionados (estructura Cso completa) */}
        <Box
          sx={{
            borderRadius: 1,
            border: '1px solid rgba(31,45,90,0.2)',
            bgcolor: 'white',
            p: 1,
          }}
        >
          <Box className="ag-theme-quartz" sx={{ height: 300, width: '100%' }}>
            <AgGridReact
              rowData={relatedRows}
              columnDefs={CsoColumnDefs}
              suppressMovableColumns={false}
              animateRows
              rowSelection="multiple"
              domLayout="normal"
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
