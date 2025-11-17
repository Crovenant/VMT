// src/modules/Pages/Dashboard/Components/DisplayData/DisplayModal.tsx
import { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Grid,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';

import type { Item } from '../../../../../Types/item';
import { VIT_MAP, VUL_MAP } from '../DisplayTable/constants/columnMaps';
import DetailFilterPanel from './DetailFilterPanel';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

type ViewType = 'VIT' | 'VUL';

type Props = {
  open: boolean;
  onClose: () => void;
  item: Item | null;
  viewType: ViewType;
};

const DEFAULT_VUL_CARD_FIELDS: string[] = [
  'Número',
  'Activo',
  'Elementos vulnerables',
  'Asignado a',
  'Grupo de asignación',
  'Prioridad',
  'Estado',
  'Actualizado',
  'VITS',
];

const DEFAULT_VIT_GRID_FIELDS: string[] = [
  'Número',
  'Estado',
  'Breve descripción',
  'Elemento de configuración',
  'Prioridad',
  'Asignado a',
  'Creado',
  'Due date',
];

export default function DetailModal({ open, onClose, item, viewType }: Props) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [selectedVulCardFields, setSelectedVulCardFields] = useState<string[]>(() =>
    DEFAULT_VUL_CARD_FIELDS.filter((label) => label in VUL_MAP),
  );

  const [selectedVitGridFields, setSelectedVitGridFields] = useState<string[]>(() =>
    DEFAULT_VIT_GRID_FIELDS.filter((label) => label in VIT_MAP),
  );

  const gridColumnDefs = useMemo<ColDef[]>(
    () =>
      Object.entries(VIT_MAP).map(([header, key]) => ({
        headerName: header,
        field: key,
        resizable: true,
        sortable: true,
        filter: 'agTextColumnFilter',
        minWidth: 120,
        wrapHeaderText: true,
        autoHeaderHeight: true,
      })),
    [],
  );

  const [relatedRows, setRelatedRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!open || !item || viewType !== 'VUL') {
      setRelatedRows([]);
      return;
    }

    const vitCode = (item as Record<string, unknown>).vitCode;
    if (!vitCode) {
      setRelatedRows([]);
      return;
    }

    const codeNorm = String(vitCode).trim();

    (async () => {
      try {
        const res = await fetch('http://localhost:8000/vit/risk-data/');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: unknown = await res.json();
        const arr: Record<string, unknown>[] = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];

        const matches = arr.filter((r) => String(r.numero ?? '').trim() === codeNorm);

        setRelatedRows(matches);
      } catch (err) {
        console.error('Error loading related VIT rows for modal:', err);
        setRelatedRows([]);
      }
    })();
  }, [open, item, viewType]);

  const vulCardPairs = useMemo(() => {
    if (!item) return [] as { label: string; value: unknown }[];
    return Object.entries(VUL_MAP).map(([label, key]) => {
      const value = item[key];
      return { label, value: value ?? '' };
    });
  }, [item]);

  const filteredVulCardPairs = vulCardPairs.filter((p) =>
    selectedVulCardFields.includes(p.label),
  );
  const filteredVitGridColumnDefs = gridColumnDefs.filter((col) =>
    selectedVitGridFields.includes(col.headerName ?? ''),
  );

  const comments: string[] = (item?.comentarios
    ? [item.comentarios]
    : (item as Item & { comments?: string[] })?.comments) ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="body"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogContent
        dividers
        sx={{
          bgcolor: '#fafbfc',
          p: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `${isPanelOpen ? '350px' : '40px'} 1fr`,
              gridTemplateRows: 'auto 1fr',
              transition: 'grid-template-columns 0.3s ease',
            }}
          >
            <Box sx={{ gridRow: '1 / span 2', bgcolor: '#f5f6f8' }}>
              <DetailFilterPanel
                isOpen={isPanelOpen}
                setIsOpen={setIsPanelOpen}
                selectedCsirtFields={selectedVitGridFields}
                setSelectedCsirtFields={setSelectedVitGridFields}
                selectedCsoFields={selectedVulCardFields}
                setSelectedCsoFields={setSelectedVulCardFields}
              />
            </Box>

            <Box
              sx={{
                gridColumn: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid #ddd',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                VUL item
              </Typography>
              <IconButton aria-label="close" onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ gridColumn: 2, p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={1.5}>
                  {filteredVulCardPairs.map(({ label, value }) => (
                    <Grid key={label} item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {String(value)}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Comments
                  </Typography>
                  <Button variant="text" size="small" sx={{ fontWeight: 700 }}>
                    ADD COMMENT
                  </Button>
                </Box>
                <Box
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 1,
                    bgcolor: '#f9f9f9',
                    minHeight: 50,
                  }}
                >
                  {comments.length > 0 ? (
                    comments.map((comment: string, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                        {comment}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No comments available
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}
              >
                VIT columns
              </Typography>

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
                    columnDefs={filteredVitGridColumnDefs}
                    suppressMovableColumns={false}
                    animateRows
                    rowSelection="multiple"
                    suppressRowClickSelection={true}
                    domLayout="normal"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}