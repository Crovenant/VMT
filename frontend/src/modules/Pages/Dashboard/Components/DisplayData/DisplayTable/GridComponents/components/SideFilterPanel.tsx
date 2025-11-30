// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/GridComponents/components/SideFilterPanel.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Box, TextField, InputAdornment, Checkbox, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type ViewType = 'VIT' | 'VUL';

type Props = {
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  allHeaders: string[];
  viewType?: ViewType;
};

const LABELS_VIT_16: string[] = [
  'Número',
  'ID externo',
  'Estado',
  'Resumen',
  'Breve descripción',
  'Elemento de configuración',
  'Prioridad',
  'Puntuación de riesgo',
  'Grupo de asignación',
  'Asignado a',
  'Creado',
  'Actualizado',
  'Sites',
  'Solución',
  'Vulnerabilidad',
  'VUL',
];

const LABELS_VUL_9: string[] = [
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

function inferViewType(allHeaders: string[]): ViewType {
  const s = new Set((allHeaders || []).map((h) => String(h).toLowerCase()));
  if (s.has('elementos vulnerables') || s.has('activo')) return 'VUL';
  return 'VIT';
}

const SideFilterPanel: React.FC<Props> = ({
  visibleColumns,
  setVisibleColumns,
  allHeaders,
  viewType,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sideFilterPanel.isOpen');
    return saved ? JSON.parse(saved) : true;
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('sideFilterPanel.isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const effectiveViewType: ViewType = useMemo(() => {
    if (viewType) return viewType;
    const w = (window as any).__currentViewType as ViewType | undefined;
    return w ?? inferViewType(allHeaders);
  }, [viewType, allHeaders]);

  // Canónicos que existan + extras que vengan del backend (nuevos campos)
  const availableFields = useMemo(() => {
    const base = effectiveViewType === 'VIT' ? LABELS_VIT_16 : LABELS_VUL_9;
    const allSet = new Set((allHeaders || []).map((h) => String(h)));
    const baseSet = new Set(base);

    const canonicalPresent = base.filter((label) => allSet.has(label));
    const extras = (allHeaders || [])
      .map((x) => String(x))
      .filter((x) => !baseSet.has(x))
      .sort((a, b) => a.localeCompare(b, 'es'));

    return [...canonicalPresent, ...extras];
  }, [effectiveViewType, allHeaders]);

  const filteredFields = useMemo(
    () => availableFields.filter((label) => label.toLowerCase().includes(search.toLowerCase())),
    [availableFields, search],
  );

  const handleToggle = (field: string) => {
    setVisibleColumns(
      visibleColumns.includes(field)
        ? visibleColumns.filter((c) => c !== field)
        : [...visibleColumns, field],
    );
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
        overflow: 'hidden',
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
          borderRight: '1px solid rgba(31, 45, 90, 0.25)',
        }}
        onClick={() => setIsOpen((v) => !v)}
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

      <Box
        sx={{
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
          p: isOpen ? 2 : 0,
          ml: isOpen ? '40px' : 0,
          overflowY: 'auto',
        }}
      >
        {isOpen && (
          <>
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
                  '& fieldset': { borderColor: 'rgba(31, 45, 90, 0.25)' },
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
            {filteredFields.map((label) => (
              <FormControlLabel
                key={label}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(label)}
                    onChange={() => handleToggle(label)}
                    size="small"
                  />
                }
                label={label}
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
