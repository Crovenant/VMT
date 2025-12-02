// src/modules/Pages/Dashboard/Components/DisplayData/Widgets/DetailFilterPanel.tsx
import { useState, useEffect } from 'react'
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  InputAdornment
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import { getCanonicalSchema, MINIMAL_SCHEMA_CATALOG } from '../../../../../Shared/FieldMapping'

type Props = {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  selectedCsirtFields: string[]
  setSelectedCsirtFields: (fields: string[]) => void
  selectedCsoFields: string[]
  setSelectedCsoFields: (fields: string[]) => void
}

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
  vits: 'VITS',
  direccionIp: 'Dirección IP',
  breveDescripcionAlt: 'Breve descripción',
  dueDate: 'Due date',
  id: 'ID',
  softwareVulnerable: 'Software vulnerable',
  comentarios: 'Comentarios',
  resolucion: 'Resolución',
  hasLink: 'Has link'
}

const csirtFields = [
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
  'Due date',
  'VUL'
]

const csoFields = [
  'Número',
  'Activo',
  'Elementos vulnerables',
  'Asignado a',
  'Grupo de asignación',
  'Prioridad',
  'Estado',
  'Actualizado',
  'VITS'
]

export default function DetailSideFilterPanel({
  isOpen,
  setIsOpen,
  selectedCsirtFields,
  setSelectedCsirtFields,
  selectedCsoFields,
  setSelectedCsoFields
}: Props) {
  const [searchCsirt, setSearchCsirt] = useState('')
  const [searchCso, setSearchCso] = useState('')
  const [vitKeys, setVitKeys] = useState<string[]>([])
  const [vulKeys, setVulKeys] = useState<string[]>([])
  useEffect(() => {
    Promise.all([
      getCanonicalSchema('VIT'),
      getCanonicalSchema('VUL')
    ])
      .then(([vit, vul]) => {
        const vitSchema: string[] = Array.isArray(vit) && vit.length ? vit : MINIMAL_SCHEMA_CATALOG.VIT.keys
        const vulSchema: string[] = Array.isArray(vul) && vul.length ? vul : MINIMAL_SCHEMA_CATALOG.VUL.keys
        const vitLabels = vitSchema.map((k) => headerMap[k] || k)
        const vulLabels = vulSchema.map((k) => headerMap[k] || k)
        setVitKeys(vitLabels.length ? vitLabels : csirtFields)
        setVulKeys(vulLabels.length ? vulLabels : csoFields)
      })
      .catch(() => {
        setVitKeys(csirtFields)
        setVulKeys(csoFields)
      })
  }, [])
  const filteredCsirt = (vitKeys.length ? vitKeys : csirtFields).filter((f) =>
    f.toLowerCase().includes(searchCsirt.toLowerCase())
  )
  const filteredCso = (vulKeys.length ? vulKeys : csoFields).filter((f) =>
    f.toLowerCase().includes(searchCso.toLowerCase())
  )
  const toggleCsirt = (field: string) => {
    setSelectedCsirtFields(
      selectedCsirtFields.includes(field)
        ? selectedCsirtFields.filter((f) => f !== field)
        : [...selectedCsirtFields, field]
    )
  }
  const toggleCso = (field: string) => {
    setSelectedCsoFields(
      selectedCsoFields.includes(field)
        ? selectedCsoFields.filter((f) => f !== field)
        : [...selectedCsoFields, field]
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
        borderRight: '1px solid rgba(31, 45, 90, 0.25)',
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
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>Vit Fields</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  size="small"
                  placeholder="Search Vit..."
                  fullWidth
                  value={searchCsirt}
                  onChange={(e) => setSearchCsirt(e.target.value)}
                  sx={{ mb: 1, backgroundColor: '#fff', borderRadius: '4px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: '#1f2d5a' }} />
                      </InputAdornment>
                    )
                  }}
                />
                {filteredCsirt.map((field) => (
                  <FormControlLabel
                    key={field}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedCsirtFields.includes(field)}
                        onChange={() => toggleCsirt(field)}
                      />
                    }
                    label={field}
                    sx={{ display: 'block', fontSize: '13px' }}
                  />
                ))}
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>Vul Fields</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  size="small"
                  placeholder="Search Vul..."
                  fullWidth
                  value={searchCso}
                  onChange={(e) => setSearchCso(e.target.value)}
                  sx={{ mb: 1, backgroundColor: '#fff', borderRadius: '4px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: '#1f2d5a' }} />
                      </InputAdornment>
                    )
                  }}
                />
                {filteredCso.map((field) => (
                  <FormControlLabel
                    key={field}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedCsoFields.includes(field)}
                        onChange={() => toggleCso(field)}
                      />
                    }
                    label={field}
                    sx={{ display: 'block', fontSize: '13px' }}
                  />
                ))}
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Box>
    </Box>
  )
}
