import { useState } from 'react';
import { Box, Collapse, IconButton, Typography} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function AccordionDetail() {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <IconButton onClick={() => setOpen(!open)} size="small">
          {open ? <ExpandLessIcon sx={{ color: '#1976d2' }} /> : <ExpandMoreIcon sx={{ color: '#1976d2' }} />}
        </IconButton>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Comments
            </Typography>
            <Box
              sx={{
                mt: 1,
                p: 2,
                backgroundColor: '#fff',
                borderRadius: 1,
                border: '1px solid #ccc',
              }}
            >
              <Typography variant="body2">
                Comments will appear here
              </Typography>
            </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Log History
            </Typography>
            <Box
              sx={{
                mt: 1,
                p: 2,
                backgroundColor: '#fff',
                borderRadius: 1,
                border: '1px solid #ccc',
              }}
            >
              <Typography variant="body2">
                Log details will appear here.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}