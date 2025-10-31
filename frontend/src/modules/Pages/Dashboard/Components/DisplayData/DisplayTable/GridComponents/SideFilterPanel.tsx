import React, { useState } from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
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
        backgroundColor: '#f5f6f8', // ✅ gris igual al card
        borderLeft: '1px solid rgba(31, 45, 90, 0.25)',
        borderRight: '1px solid rgba(31, 45, 90, 0.25)', // ✅ borde derecho
        borderTop: '1px solid rgba(31, 45, 90, 0.25)', // ✅ borde superior
        borderBottom: '1px solid rgba(31, 45, 90, 0.25)', // ✅ borde inferior
        transition: 'width 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Botón vertical siempre visible */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: '#f5f6f8',
          borderRight: '1px solid rgba(31, 45, 90, 0.25)', // ✅ borde derecho también aquí
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Box
          sx={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1f2d5a',
          }}
        >
          Filters
        </Box>
      </Box>

      {/* Contenido del panel */}
      {isOpen && (
        <Box sx={{ p: 2, ml: '40px' }}>
          <TextField
            size="small"
            placeholder="Search..."
            fullWidth
            sx={{
              backgroundColor: '#ffffff', // ✅ ahora blanco
              borderRadius: '4px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(31, 45, 90, 0.25)',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#1f2d5a' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default SideFilterPanel;