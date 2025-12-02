// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/GridComponents/components/SideFilterPanel.tsx
import React, { useMemo, useState, useEffect } from 'react'
import { Box, TextField, InputAdornment, Checkbox, FormControlLabel } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { MINIMAL_SCHEMA_CATALOG, useFieldSchema } from '../../../../../../../Shared/FieldMapping'

type ViewType = 'VIT' | 'VUL'

type Props = {
  visibleColumns: string[]
  setVisibleColumns: (cols: string[]) => void
  allHeaders: string[]
  viewType?: ViewType
}

const LABEL_OVERRIDES: Record<ViewType, Record<string, string>> = {
  VIT: {
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
    creado: 'Creado',
    actualizado: 'Actualizado',
    sites: 'Sites',
    vulnerabilitySolution: 'Solución',
    vulnerabilidad: 'Vulnerabilidad',
    dueDate: 'Due date',
    vul: 'VUL'
  },
  VUL: {
    numero: 'Número',
    activo: 'Activo',
    elementosVulnerables: 'Elementos vulnerables',
    asignadoA: 'Asignado a',
    grupoAsignacion: 'Grupo de asignación',
    prioridad: 'Prioridad',
    estado: 'Estado',
    actualizado: 'Actualizado',
    vits: 'VITS'
  }
}

const EXCLUDED_KEYS = new Set(['comentarios', 'hasLink', 'logHistory'])

function inferViewType(allHeaders: string[]): ViewType {
  const s = new Set((allHeaders || []).map((h) => String(h).toLowerCase()))
  if (s.has('elementos vulnerables') || s.has('activo')) return 'VUL'
  return 'VIT'
}

const SideFilterPanel: React.FC<Props> = ({ visibleColumns, setVisibleColumns, allHeaders, viewType }) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sideFilterPanel.isOpen')
    return saved ? JSON.parse(saved) : true
  })
  const [search, setSearch] = useState('')
  useEffect(() => {
    localStorage.setItem('sideFilterPanel.isOpen', JSON.stringify(isOpen))
  }, [isOpen])
  const effectiveViewType: ViewType = useMemo(() => {
    if (viewType) return viewType
    const w = (window as any).__currentViewType as ViewType | undefined
    return w ?? inferViewType(allHeaders)
  }, [viewType, allHeaders])
  const { fields } = useFieldSchema(effectiveViewType)
  const availableFields = useMemo(() => {
    const baseKeys = fields.length ? fields : MINIMAL_SCHEMA_CATALOG[effectiveViewType].keys
    const filteredKeys = baseKeys.filter((k) => !EXCLUDED_KEYS.has(k))
    const labels = filteredKeys.map((key) => LABEL_OVERRIDES[effectiveViewType][key] || key)
    const existing = new Set(labels)
    const extras = (allHeaders || [])
      .map((x) => String(x))
      .filter((x) => !existing.has(x))
      .filter((x) => !EXCLUDED_KEYS.has(x))
      .sort((a, b) => a.localeCompare(b, 'es'))
    return [...labels, ...extras]
  }, [effectiveViewType, fields, allHeaders])
  const filteredFields = useMemo(
    () => availableFields.filter((label) => label.toLowerCase().includes(search.toLowerCase())),
    [availableFields, search]
  )
  const handleToggle = (field: string) => {
    setVisibleColumns(
      visibleColumns.includes(field)
        ? visibleColumns.filter((c) => c !== field)
        : [...visibleColumns, field]
    )
  }
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
        onClick={() => setIsOpen((v) => !v)}
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
              onChange={(e) => setSearch(e.target.value)}
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
  )
}

export default SideFilterPanel
