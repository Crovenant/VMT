// src/modules/Pages/Dashboard/Components/DisplayData/Widgets/DetailModal.tsx
import { useMemo, useState } from 'react';
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

type Props = {
  open: boolean;
  onClose: () => void;
  item: Item | null;
};

export default function DetailModal({ open, onClose, item }: Props) {
  const vitFields = useMemo(() => Object.keys(VIT_MAP), []);
  const vulFields = useMemo(() => Object.keys(VUL_MAP), []);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedVitFields, setSelectedVitFields] = useState<string[]>(vitFields);
  const [selectedVulFields, setSelectedVulFields] = useState<string[]>(vulFields);

  const vulColumnDefs = useMemo<ColDef[]>(
    () =>
      Object.keys(VUL_MAP).map((header) => ({
        headerName: header,
        field: header,
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

  const vitPairs = useMemo(() => {
    if (!item) return [];
    return Object.entries(VIT_MAP).map(([label, key]) => {
      const value = (item as any)[key];
      return { label, value: value ?? '' };
    });
  }, [item]);

  const filteredVitPairs = vitPairs.filter((p) => selectedVitFields.includes(p.label));
  const filteredVulColumnDefs = vulColumnDefs.filter((col) =>
    selectedVulFields.includes(col.headerName ?? ''),
  );

  const comments: string[] = (item as Item & { comments?: string[] })?.comments ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogContent dividers sx={{ bgcolor: '#fafbfc', p: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `${isPanelOpen ? '350px' : '40px'} 1fr`,
            gridTemplateRows: 'auto 1fr',
            transition: 'grid-template-columns 0.3s ease',
            height: '100%',
          }}
        >
          <Box sx={{ gridRow: '1 / span 2', bgcolor: '#f5f6f8' }}>
            <DetailFilterPanel
              isOpen={isPanelOpen}
              setIsOpen={setIsPanelOpen}
              selectedCsirtFields={selectedVitFields}
              setSelectedCsirtFields={setSelectedVitFields}
              selectedCsoFields={selectedVulFields}
              setSelectedCsoFields={setSelectedVulFields}
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
              VIT item
            </Typography>
            <IconButton aria-label="close" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ gridColumn: 2, p: 2, overflowY: 'auto' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1.5}>
                {filteredVitPairs.map(({ label, value }) => (
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

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>
              VUL columns
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
                  columnDefs={filteredVulColumnDefs}
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
      </DialogContent>
    </Dialog>
  );
}
