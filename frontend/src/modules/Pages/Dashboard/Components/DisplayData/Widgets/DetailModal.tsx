// src/modules/Pages/Dashboard/Components/DisplayData/DetailModal.tsx
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Grid,
  Typography,
  Divider,
  Button,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { GridApi, ColumnApi } from 'ag-grid-community';
import type { Item } from '../../../../../Types/item';
import { VIT_MAP, VUL_MAP } from '../DisplayTable/constants/columnMaps';
import DetailFilterPanel from './DetailFilterPanel';
import { mapVUL, mapVIT } from '../../../hooks/useDisplayData';
import { selectionColDef } from '../DisplayTable/GridComponents/columns/selectionColumn';
import { createEyeColDef } from '../DisplayTable/GridComponents/columns/eyeColumn';
import ExtButton from './buttons/exportButton';
import MailTo from './buttons/mailButton';
import { exportGridFromModal } from '../Export/exportGridFromModal';
import { mailGridFromModal } from '../Export/mailGridFromModal';
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

type Comment = {
  id: number;
  author: string;
  text: string;
  created_at: string;
};

const API_BASE = 'http://localhost:8000';

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

function formatHeaderLabel(label?: string): string | undefined {
  if (!label) return label;
  const words = String(label).split(/\s+/);
  if (words.length <= 2) return label;
  const first = words.slice(0, 2).join(' ');
  const rest = words.slice(2).join(' ');
  return `${first}\n${rest}`;
}

function formatDateTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

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
        wrapText: true,
        autoHeight: true,
        cellClass: 'cell-wrap-2',
        headerClass: 'custom-header',
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.35' },
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
        wrapText: true,
        autoHeight: true,
        cellClass: 'cell-wrap-2',
        headerClass: 'custom-header',
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.35' },
      })),
    [],
  );

  const [relatedRows, setRelatedRows] = useState<Item[]>([]);
  const gridRef = useRef<AgGridReact<any>>(null);

  // 🔹 Comentarios del item
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentText, setCommentText] = useState('');

  const idLabel = item?.numero ?? item?.id ?? 'INC-???';

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

  // 🔹 Cargar comentarios desde backend cuando abrimos el modal o cambia el item
  useEffect(() => {
    if (!open || !item) {
      setComments([]);
      setIsAddingComment(false);
      setCommentText('');
      return;
    }

    const numero = String(item.numero ?? item.id ?? '');
    if (!numero) return;

    const base =
      viewType === 'VUL'
        ? `${API_BASE}/vul/comments/`
        : `${API_BASE}/vit/comments/`;
    const url = `${base}${encodeURIComponent(numero)}/`;

    let cancelled = false;

    const loadComments = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as Comment[];
        if (!cancelled) {
          setComments(Array.isArray(data) ? data : []);
        }
      } catch {
        // silencioso
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };
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

  const filteredVitGridColumnDefs = useMemo(
    () =>
      vitGridColumnDefs
        .filter((col) => selectedVitGridFields.includes(col.headerName ?? ''))
        .map((c) => ({ ...c, headerName: formatHeaderLabel(c.headerName as string) })),
    [vitGridColumnDefs, selectedVitGridFields],
  );

  const filteredVulGridColumnDefs = useMemo(
    () =>
      vulGridColumnDefs
        .filter((col) => selectedVulCardFields.includes(col.headerName ?? ''))
        .map((c) => ({ ...c, headerName: formatHeaderLabel(c.headerName as string) })),
    [vulGridColumnDefs, selectedVulCardFields],
  );

  const handleExportModalGrid = () => {
    console.log('Export main item:', item);
  };

  const handleExportAssociatedGrid = () => {
    const api = gridRef.current?.api;
    const selectedRows = api?.getSelectedRows?.() ?? [];
    exportGridFromModal(relatedRows, selectedRows as Item[], viewType === 'VUL');
  };

  const handleSendMail = () => {
    const api = gridRef.current?.api;
    const selectedRows = api?.getSelectedRows?.() ?? [];
    mailGridFromModal(relatedRows, selectedRows as Item[], viewType === 'VUL');
  };

  const autoSizeVisibleColumns = useCallback((api?: GridApi | null, colApi?: ColumnApi | null) => {
    if (!api || !colApi) return;
    const displayed = colApi.getAllDisplayedColumns?.() ?? [];
    const ids = displayed
      .filter((c) => {
        const def = c.getColDef();
        if (def.checkboxSelection) return false;
        if (def.field === '__eye__') return false;
        return true;
      })
      .map((c) => c.getColId());
    if (ids.length) colApi.autoSizeColumns(ids, true);
  }, []);

  const onFirstDataRendered = useCallback(
    (e: any) => {
      autoSizeVisibleColumns(e.api as GridApi, e.columnApi as ColumnApi);
    },
    [autoSizeVisibleColumns],
  );

  const onModelUpdated = useCallback(
    (e: any) => {
      autoSizeVisibleColumns(e.api as GridApi, e.columnApi as ColumnApi);
    },
    [autoSizeVisibleColumns],
  );

  // 🔹 Handlers de comentarios en el modal
  const handleStartAddComment = () => {
    setIsAddingComment(true);
  };

  const handleCancelAddComment = () => {
    setIsAddingComment(false);
    setCommentText('');
  };

  const handleSaveComment = async () => {
    if (!item) return;
    const text = commentText.trim();
    if (!text) return;

    const numero = String(item.numero ?? item.id ?? '');
    if (!numero) return;

    const base =
      viewType === 'VUL'
        ? `${API_BASE}/vul/comments/`
        : `${API_BASE}/vit/comments/`;
    const url = `${base}${encodeURIComponent(numero)}/`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author: 'Krovean' }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as Comment[];
      setComments(Array.isArray(data) ? data : []);
      setCommentText('');
      setIsAddingComment(false);
    } catch {
      // silencioso
    }
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
                <MailTo onClick={() => console.log('Mail main item')} />
                <ExtButton onClick={handleExportModalGrid} />
                <IconButton aria-label="close" onClick={onClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ gridColumn: 2, p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={1.5}>
                  {(viewType === 'VUL' ? filteredVulCardPairs : filteredVitCardPairs).map(
                    ({ label, value }) => (
                      <Grid key={label} item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {String(value)}
                        </Typography>
                      </Grid>
                    ),
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* 🔹 Comments section (mismo backend que el grid) */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Comments
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    sx={{ fontWeight: 700 }}
                    onClick={handleStartAddComment}
                  >
                    ADD COMMENT
                  </Button>
                </Box>
                <Box
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 1.5,
                    bgcolor: '#f9f9f9',
                    minHeight: 50,
                  }}
                >
                  {comments.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {comments.map((c) => (
                        <Box key={c.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(c.created_at)}
                          </Typography>
                          <Typography variant="body2">• {c.text}</Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : !isAddingComment ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No comments available
                    </Typography>
                  ) : null}

                  {isAddingComment && (
                    <Box sx={{ mt: comments.length ? 2 : 0 }}>
                      <TextField
                        multiline
                        fullWidth
                        minRows={2}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={`New comment for ${idLabel}`}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                        <Button size="small" onClick={handleCancelAddComment}>
                          CANCEL
                        </Button>
                        <Button size="small" variant="contained" onClick={handleSaveComment}>
                          SAVE
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

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
                  '& .ag-header-cell-text': { whiteSpace: 'pre-line' },
                  '& .ag-cell.cell-wrap-2': {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    whiteSpace: 'normal',
                  },
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
                    onFirstDataRendered={onFirstDataRendered}
                    onModelUpdated={onModelUpdated}
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
