import React, { useState } from 'react';
import { Box, TextField, InputAdornment, Checkbox, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import useItems from '../../../../../../Shared/hooks/useItems'; // Ajusta la ruta según tu estructura

// ✅ Mapeo amigable (igual que en columnDefs, sin "id")
const headerMap: Record<string, string> = {
  nombre: 'Nombre',
  numero: 'Número',
  idExterno: 'ID externo',
  estado: 'Estado',
  resumen: 'Resumen',
  breveDescripcion: 'Breve descripción',
  elementoConfiguracion: 'Elemento de configuración',
  fechaCreacion: 'Fecha de creación',
  prioridad: 'Prioridad',
  puntuacionRiesgo: 'Puntuación de riesgo',
  grupoAsignacion: 'Grupo de asignación',
  asignadoA: 'Asignado a',
  sites: 'Sites',
  vulnerabilidad: 'Vulnerabilidad',
  vulnerabilitySolution: 'Solución de vulnerabilidad',
  creado: 'Creado',
  actualizado: 'Actualizado',
};

const SideFilterPanel: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { items } = useItems(refreshKey ?? 0);
  const headers = items.length > 0 ? Object.keys(items[0]).filter((h) => h !== 'id') : [];

  const [visibleFields, setVisibleFields] = useState<string[]>(headers);

  const filteredFields = headers.filter((f) =>
    (headerMap[f] || f).toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (field: string) => {
    setVisibleFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: isOpen ? '350px' : '40px', // ✅ más ancho
        backgroundColor: '#f5f6f8',
        border: '1px solid rgba(31, 45, 90, 0.25)',
        transition: 'width 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Botón vertical */}
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
          borderRight: '1px solid rgba(31, 45, 90, 0.25)',
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

      {/* Contenido */}
      {isOpen && (
        <Box sx={{ p: 2, ml: '40px', overflowY: 'auto' }}>
          {/* Buscador */}
          <TextField
            size="small"
            placeholder="Search..."
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              mb: 2,
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

          {/* Lista con checkbox */}
          {filteredFields.map((field) => (
            <FormControlLabel
              key={field}
              control={
                <Checkbox
                  checked={visibleFields.includes(field)}
                  onChange={() => handleToggle(field)}
                  size="small"
                />
              }
              label={headerMap[field] || field}
              sx={{
                display: 'block',
                color: '#1f2d5a',
                fontSize: '13px', // ✅ más pequeño
                mb: 0.5,
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SideFilterPanel;