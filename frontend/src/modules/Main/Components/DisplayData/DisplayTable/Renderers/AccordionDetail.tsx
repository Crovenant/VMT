import { useState } from 'react';
import { Box, Button, Collapse, IconButton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Item } from '../../../../types/item';

export default function AccordionDetail({
  item,
  defaultLogCollapsed = true,
  onToggleLog,
}: {
  item?: Item;
  defaultLogCollapsed?: boolean;
  onToggleLog?: (collapsed: boolean) => void;
}) {
  const [logCollapsed, setLogCollapsed] = useState<boolean>(defaultLogCollapsed);

  const toggleLog = () => {
    const next = !logCollapsed;
    setLogCollapsed(next);
    onToggleLog?.(next);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header de Comments + botón Add comment (se queda a la derecha) */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Comments:
        </Typography>
        <Button variant="outlined" size="small">Add comment</Button>
      </Box>

      {/* Contenido de Comments */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
        }}
      >
        <Typography variant="body2">
          {`Comments for ${item?.numero ?? item?.id ?? 'INC-???'}`}
        </Typography>
      </Box>

      {/* Header de Log History con flecha a la IZQUIERDA */}
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
          }}
        >
          <Typography variant="body2">
            {`Logs for ${item?.numero ?? item?.id ?? 'INC-???'}`}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
