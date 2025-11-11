import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
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
import { CSIRT_MAP, CSO_MAP } from '../DisplayTable/constants/columnMaps';
import DetailFilterPanel from './DetailFilterPanel';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const csirtFields = [
  'Número', 'Estado', 'Resumen', 'Breve descripción', 'Elemento de configuración',
  'Prioridad', 'Puntuación de riesgo', 'Grupo de asignación', 'Asignado a',
  'Creado', 'Actualizado', 'Due date', 'Sites', 'Solución'
];

const csoFields = [
  'Severity', 'State', 'Category ASVS', 'ASVS ID', 'OWASP TOP 10', 'PCI Status',
  'Threat Description', 'Details', 'Target', 'Detection Date', 'Deadline',
  'Days Open', 'Countermeasure', 'Environment', 'References / CWE', 'CVSS Base',
  'CVSS Overall', 'CVSS Rescored', 'EPSS', 'Easy of Exploit', 'CVSS Version',
  'CVSS Vector', 'Resolution Date', 'IT Owner', 'SW Provider', 'Critical Case',
  'Fecha comunicación SWF', 'Certificación pedida', 'Fecha mitigacion',
  'Fecha certificación'
];

type Props = {
  open: boolean;
  onClose: () => void;
  item: Item | null;
};

export default function DetailModal({ open, onClose, item }: Props) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCsirtFields, setSelectedCsirtFields] = useState(csirtFields);
  const [selectedCsoFields, setSelectedCsoFields] = useState(csoFields);

  const CsoColumnDefs = useMemo<ColDef[]>(
    () =>
      Object.keys(CSO_MAP).map((header) => ({
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

  const CsirtPairs = useMemo(() => {
    if (!item) return [];
    return Object.entries(CSIRT_MAP).map(([label, key]) => {
      const value = (item as any)[key];
      return { label, value: value ?? '' };
    });
  }, [item]);

  const filteredCsirtPairs = CsirtPairs.filter(p => selectedCsirtFields.includes(p.label));
  const filteredCsoColumnDefs = CsoColumnDefs.filter(col =>
    selectedCsoFields.includes(col.headerName ?? '')
  );

  // ✅ Extraer comments con tipado seguro
  const comments: string[] = (item as Item & { comments?: string[] })?.comments ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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

      <DialogContent dividers sx={{ bgcolor: '#fafbfc', p: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `${isPanelOpen ? '350px' : '40px'} 1fr`,
            transition: 'grid-template-columns 0.3s ease',
            height: '100%',
          }}
        >
          {/* Panel lateral */}
          <DetailFilterPanel
            isOpen={isPanelOpen}
            setIsOpen={setIsPanelOpen}
            selectedCsirtFields={selectedCsirtFields}
            setSelectedCsirtFields={setSelectedCsirtFields}
            selectedCsoFields={selectedCsoFields}
            setSelectedCsoFields={setSelectedCsoFields}
          />

          {/* Contenido principal */}
          <Box sx={{ p: 2, overflowY: 'auto' }}>
            {/* Bloque Csirt */}
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1.5}>
                {filteredCsirtPairs.map(({ label, value }) => (
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

            {/* Bloque fijo Comments */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Comments:
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

            {/* Grid Cso */}
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
                  columnDefs={filteredCsoColumnDefs}
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
