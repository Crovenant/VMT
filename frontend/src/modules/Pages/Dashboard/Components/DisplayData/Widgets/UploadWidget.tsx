// src/modules/Main/Components/DisplayData/Widgets/UploadWidget.tsx
import React, { useState } from 'react';
import { IconButton, Popover, Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface UploadWidgetProps {
  onUpload: (type: 'Csirt' | 'Cso') => void;
}

const UploadWidget: React.FC<UploadWidgetProps> = ({ onUpload }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: '#1976d2', // Azul
          backgroundColor: '#e3f2fd',
          borderRadius: '6px',
          '&:hover': { backgroundColor: '#bbdefb' },
        }}
      >
        <CloudUploadIcon />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, gap: 1 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#4caf50', color: '#fff' }}
            onClick={() => {
              onUpload('Csirt');
              handleClose();
            }}
          >
            Csirt
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#4caf50', color: '#fff' }}
            onClick={() => {
              onUpload('Cso');
              handleClose();
            }}
          >
            Cso
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default UploadWidget;