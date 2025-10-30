import React, { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SideFilterPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: isOpen ? '250px' : '40px',
        backgroundColor: '#f5f6f8',
        borderLeft: '1px solid #ddd',
        transition: 'width 0.3s ease',
        cursor: 'pointer', // ✅ todo el bloque clicable
      }}
      onClick={() => setIsOpen(!isOpen)} // ✅ todo el panel actúa como botón
    >
      {/* Contenido del panel */}
      {isOpen ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Filters
          </Typography>
          <TextField
            size="small"
            placeholder="Search..."
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" />,
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1, // ✅ ocupa todo el alto
          }}
        >
          <Typography
            sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Filters
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SideFilterPanel;