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
import { TSHIRT_MAP, SOUP_MAP } from '../DisplayTable/constants/columnMaps';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

type Props = {
  open: boolean;
  onClose: () => void;
  item: Item | null;
};

export default function DetailModal({ open, onClose, item }: Props) {
  // Columnas SOUP (estructura, sin datos aún)
  const soupColumnDefs = useMemo<ColDef[]>(
    () =>
      Object.keys(SOUP_MAP).map((header) => ({
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

  // Pares etiqueta/valor para TODOS los campos TSHIRT (en orden de TSHIRT_MAP)
  const tshirtPairs = useMemo(() => {
    if (!item) return [];
    return Object.entries(TSHIRT_MAP).map(([label, key]) => {
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
          Tshirt item.
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
        {/* Bloque de campos TSHIRT */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1.5}>
            {tshirtPairs.map(({ label, value }) => (
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

        {/* Subtítulo sección SOUP */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            mb: 1.5,
          }}
        >
          Soup items.
        </Typography>

        {/* Grid de componentes relacionados (estructura SOUP completa) */}
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
              columnDefs={soupColumnDefs}
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
