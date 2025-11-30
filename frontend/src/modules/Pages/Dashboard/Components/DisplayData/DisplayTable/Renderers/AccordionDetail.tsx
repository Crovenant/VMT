// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/Renderers/AccordionDetail.tsx
import { useEffect, useState } from 'react';
import { Box, Button, Collapse, IconButton, Typography, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Item } from '../../../../../../Types/item';

type ViewType = 'VIT' | 'VUL';

type Comment = {
  id: number;
  author: string;
  text: string;
  created_at: string;
};

const API_BASE = 'http://localhost:8000';

function formatDateTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(); // usa la localización del navegador
}

export default function AccordionDetail({
  item,
  defaultLogCollapsed = true,
  onToggleLog,
  viewType,
  onSizeChange,
}: {
  item?: Item;
  defaultLogCollapsed?: boolean;
  onToggleLog?: (collapsed: boolean) => void;
  viewType: ViewType;
  onSizeChange?: () => void;
}) {
  const [logCollapsed, setLogCollapsed] = useState<boolean>(defaultLogCollapsed);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [commentText, setCommentText] = useState('');

  const idLabel = item?.numero ?? item?.id ?? 'INC-???';

  useEffect(() => {
    if (!item) return;
    const numero = String(item.numero ?? item.id ?? '');
    if (!numero) return;

    const base =
      viewType === 'VUL'
        ? `${API_BASE}/vul/comments/`
        : `${API_BASE}/vit/comments/`;
    const url = `${base}${encodeURIComponent(numero)}/`;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as Comment[];
        if (!cancelled) {
          setComments(Array.isArray(data) ? data : []);
        }
      } catch {
      } finally {
        if (!cancelled && onSizeChange) {
          setTimeout(onSizeChange, 0);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [item, viewType, onSizeChange]);

  useEffect(() => {
    if (onSizeChange) {
      setTimeout(onSizeChange, 0);
    }
  }, [comments.length, isAdding, commentText, onSizeChange]);

  const toggleLog = () => {
    const next = !logCollapsed;
    setLogCollapsed(next);
    onToggleLog?.(next);
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    if (onSizeChange) setTimeout(onSizeChange, 0);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setCommentText('');
    if (onSizeChange) setTimeout(onSizeChange, 0);
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
      setIsAdding(false);
    } catch {
    } finally {
      if (onSizeChange) setTimeout(onSizeChange, 0);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header de Comments + botón Add comment */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Comments:
        </Typography>
        <Button variant="text" size="small" sx={{ fontWeight: 700 }} onClick={handleStartAdd}>
          ADD COMMENT
        </Button>
      </Box>

      {/* Contenido de Comments */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          mx: 1,
        }}
      >
        {comments.length === 0 && !isAdding && (
          <Typography variant="body2">
            {`No comments for ${idLabel}`}
          </Typography>
        )}

        {comments.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: isAdding ? 2 : 0 }}>
            {comments.map((c) => {
              const ts = formatDateTime(c.created_at);
              return (
                <Box key={c.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" color="text.secondary">
                    {ts}
                  </Typography>
                  <Typography variant="body2">• {c.text}</Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {isAdding && (
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
              <Button size="small" onClick={handleCancelAdd}>
                CANCEL
              </Button>
              <Button size="small" variant="contained" onClick={handleSaveComment}>
                SAVE
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Header de Log History */}
      <Box
        sx={{
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderTop: '1px solid #e9ecef',
          pt: 1,
        }}
      >
        <IconButton
          size="small"
          onClick={toggleLog}
          sx={{
            transform: logCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
          aria-label={logCollapsed ? 'Expand log' : 'Collapse log'}
        >
          <ExpandMoreIcon />
        </IconButton>

        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Log History:
        </Typography>
      </Box>

      {/* Cuerpo del Log (colapsable) */}
      <Collapse in={!logCollapsed} unmountOnExit appear timeout={150}>
        <Box
          sx={{
            p: 2,
            bgcolor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            mx: 1,
            mt: 1,
          }}
        >
          <Typography variant="body2">
            {`Logs for ${idLabel}`}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
