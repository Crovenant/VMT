
// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/GridComponents/components/SideFilterPanel.tsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, InputAdornment, Checkbox, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const headerMap: Record<string, string> = {
  numero: 'Número',
  idExterno: 'ID externo',
  estado: 'Estado',
  resumen: 'Resumen',
  breveDescripcion: 'Breve descripción',
  elementoConfiguracion: 'Elemento de configuración',
  prioridad: 'Prioridad',
  puntuacionRiesgo: 'Puntuación de riesgo',
  grupoAsignacion: 'Grupo de asignación',
  asignadoA: 'Asignado a',
  sites: 'Sites',
  vulnerabilidad: 'Vulnerabilidad',
  vulnerabilitySolution: 'Solución',
  creado: 'Creado',
  actualizado: 'Actualizado',
  vul: 'VUL',
  activo: 'Activo',
  elementosVulnerables: 'Elementos vulnerables',
  vits: 'VITS'
};

type Props = {
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  allHeaders: string[];
};

const SideFilterPanel: React.FC<Props> = ({ visibleColumns, setVisibleColumns, allHeaders }) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sideFilterPanel.isOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [search, setSearch] = useState('');
  const [schema, setSchema] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('sideFilterPanel.isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    try {
      const vt = (window as any).__currentViewType as 'VIT' | 'VUL' | undefined;
      if (vt) {
        fetch(`/common/get-schema/?viewType=${vt}`)
          .then(res => res.json())
          .then(data => setSchema(Array.isArray(data.schema) ? data.schema : []))
          .catch(() => setSchema([]));
      } else {
        setSchema([]);
      }
    } catch {
      setSchema([]);
    }
  }, []);

  const availableFields = schema.length > 0 ? schema : allHeaders;
  const filteredFields = availableFields.filter(f =>
    (headerMap[f] || f).toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (field: string) => {
    const updated = visibleColumns.includes(field)
      ? visibleColumns.filter(c => c !== field)
      : [...visibleColumns, field];
    setVisibleColumns(updated);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: isOpen ? '350px' : '40px',
        backgroundColor: '#f5f6f8',
        border: '1px solid rgba(31, 45, 90, 0.25)',
        transition: 'width 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
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
          borderRight: '1px solid rgba(31, 45, 90, 0.25)'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Box
          sx={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1f2d5a'
          }}
        >
          Filters
        </Box>
      </Box>

      <Box
        sx={{
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
          p: isOpen ? 2 : 0,
          ml: isOpen ? '40px' : 0,
          overflowY: 'auto'
        }}
      >
        {isOpen && (
          <>
            <TextField
              size="small"
              placeholder="Search..."
              fullWidth
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(31, 45, 90, 0.25)' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#1f2d5a' }} />
                  </InputAdornment>
                )
              }}
            />
            {filteredFields.map(field => (
              <FormControlLabel
                key={field}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(field)}
                    onChange={() => handleToggle(field)}
                    size="small"
                  />
                }
                label={headerMap[field] || field}
                sx={{ display: 'block', color: '#1f2d5a', fontSize: '13px', mb: 0.5 }}
              />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default SideFilterPanel;
