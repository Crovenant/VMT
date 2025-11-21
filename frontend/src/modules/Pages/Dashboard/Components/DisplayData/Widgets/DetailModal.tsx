// src/modules/Pages/Dashboard/Components/DisplayData/Widgets/DetailModal.tsx
import { useMemo, useState, useEffect, useRef } from 'react';
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
import { mapVUL, mapVIT } from '../../../hooks/useDisplayData';
import { selectionColDef } from '../DisplayTable/GridComponents/columns/selectionColumn';
import { createEyeColDef } from '../DisplayTable/GridComponents/columns/eyeColumn';
import ExtButton from './buttons/exportButton';
import MailTo from './buttons/mailButton';
import { exportGridFromModal } from '../Export/exportGridFromModal';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

type ViewType = 'VIT' | 'VUL';
type Props = {
  open: boolean;
  onClose: () => void;
  item: Item | null;
  viewType: ViewType;
  onNavigateToItem: (item: Item) => void;
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
  'VUL',
];

export default function DetailModal({ open, onClose, item, viewType, onNavigateToItem }: Props) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedVulCardFields, setSelectedVulCardFields] = useState<string[]>(
    () => DEFAULT_VUL_CARD_FIELDS.filter((label) => label in VUL_MAP),
  );
  const [selectedVitGridFields, setSelectedVitGridFields] = useState<string[]>(
    () => DEFAULT_VIT_GRID_FIELDS.filter((label) => label in VIT_MAP),
  );

  const vitGridColumnDefs = useMemo<ColDef[]>(
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

  const vulGridColumnDefs = useMemo<ColDef[]>(
    () =>
      Object.entries(VUL_MAP).map(([header, key]) => ({
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

  const [relatedRows, setRelatedRows] = useState<Item[]>([]);
  const gridRef = useRef<AgGridReact<any>>(null);

  useEffect(() => {
    if (!open || !item) {
      setRelatedRows([]);
      return;
    }
    if (viewType === 'VUL') {
      const vitObjects = item.vitsData && item.vitsData.length > 0 ? item.vitsData : [];
      const normalizedVits = vitObjects.map((vit) => mapVIT(vit));
      setRelatedRows(normalizedVits);
    } else {
      const associatedVul = item.vulData && Object.keys(item.vulData).length > 0 ? item.vulData : null;
      const normalizedAssociatedVul = associatedVul ? mapVUL(associatedVul) : null;
      setRelatedRows(normalizedAssociatedVul ? [normalizedAssociatedVul] : []);
    }
  }, [open, item, viewType]);

  const vulCardPairs = useMemo(() => {
    if (!item) return [] as { label: string; value: unknown }[];
    return Object.entries(VUL_MAP).map(([label, key]) => {
      const value = item[key];
      return { label, value: value ?? '' };
    });
  }, [item]);

  const vitCardPairs = useMemo(() => {
    if (!item) return [] as { label: string; value: unknown }[];
    return Object.entries(VIT_MAP).map(([label, key]) => {
      const value = item[key];
      return { label, value: value ?? '' };
    });
  }, [item]);

  const filteredVulCardPairs = vulCardPairs.filter((p) => selectedVulCardFields.includes(p.label));
  const filteredVitCardPairs = vitCardPairs.filter((p) => selectedVitGridFields.includes(p.label));

  const filteredVitGridColumnDefs = vitGridColumnDefs.filter((col) =>
    selectedVitGridFields.includes(col.headerName ?? ''),
  );
  const filteredVulGridColumnDefs = vulGridColumnDefs.filter((col) =>
    selectedVulCardFields.includes(col.headerName ?? ''),
  );

  const comments: string[] =
    (item?.comentarios ? [item.comentarios] : (item as Item & { comments?: string[] })?.comments) ?? [];

  const handleExportModalGrid = () => {
    console.log('Export grid data:', relatedRows);
  };

  const handleSendMail = () => {
    console.log('Send mail for item:', item);
  };

  const handleExportAssociatedGrid = () => {
    const api = gridRef.current?.api;
    const selectedRows = api?.getSelectedRows?.() ?? [];
    exportGridFromModal(relatedRows, selectedRows as Item[], viewType === 'VUL');
  };

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
        <Box sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
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

            {/* Header */}
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
                {viewType === 'VUL' ? 'VUL item' : 'VIT item'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <MailTo onClick={handleSendMail} />
                <ExtButton onClick={handleExportModalGrid} />
                <IconButton aria-label="close" onClick={onClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ gridColumn: 2, p: 2 }}>
              {/* Parte superior */}
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={1.5}>
                  {(viewType === 'VUL' ? filteredVulCardPairs : filteredVitCardPairs).map(({ label, value }) => (
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

              {/* Comments */}
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

              {/* Parte inferior */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {viewType === 'VUL' ? 'VIT associated' : 'VUL associated'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <MailTo onClick={handleSendMail} />
                  <ExtButton onClick={handleExportAssociatedGrid} />
                </Box>
              </Box>

              <Box
                sx={{
                  borderRadius: 1,
                  border: '1px solid rgba(31,45,90,0.2)',
                  bgcolor: 'white',
                  p: 1,
                }}
              >
                <Box className="ag-theme-quartz" style={{ width: '100%' }}>
                  <AgGridReact
                    ref={gridRef}
                    rowData={relatedRows}
                    columnDefs={[
                      selectionColDef,
                      createEyeColDef(onNavigateToItem, (it) => Boolean(it.hasLink)),
                      ...(viewType === 'VUL' ? filteredVitGridColumnDefs : filteredVulGridColumnDefs),
                    ]}
                    suppressMovableColumns={false}
                    animateRows
                    rowSelection="multiple"
                    suppressRowClickSelection={true}
                    domLayout="autoHeight"
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
