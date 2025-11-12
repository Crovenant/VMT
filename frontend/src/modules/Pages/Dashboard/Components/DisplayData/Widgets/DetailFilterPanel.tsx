import { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

type Props = {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  selectedCsirtFields: string[];
  setSelectedCsirtFields: (fields: string[]) => void;
  selectedCsoFields: string[];
  setSelectedCsoFields: (fields: string[]) => void;
};

// VIT (csirt) — incluye los 22 del Excel y los ya definidos en VIT_MAP (sin el alias "Vulnerability solution")
const csirtFields = [
  'Número',
  'ID externo',
  'Estado',
  'Resumen',
  'Breve descripción',
  'Elemento de configuración',
  'Dirección IP',
  'Prioridad',
  'Puntuación de riesgo',
  'Grupo de asignación',
  'Asignado a',
  'Creado',
  'Actualizado',
  'Due date',
  'Fecha creación',
  'Sites',
  'Vulnerabilidad',
  'Solución',
  'Aplazado por',
  'Fecha de aplazamiento',
  'Notas de aplazamiento',
  'Software vulnerable',
  'Resolución',
  'Comentarios',
];

// VUL (cso)
const csoFields = [
  'Severity',
  'State',
  'Category ASVS',
  'ASVS ID',
  'OWASP TOP 10',
  'PCI Status',
  'Threat Description',
  'Details',
  'Target',
  'Detection Date',
  'Deadline',
  'Days Open',
  'Countermeasure',
  'Environment',
  'References / CWE',
  'CVSS Base',
  'CVSS Overall',
  'CVSS Rescored',
  'EPSS',
  'Easy of Exploit',
  'CVSS Version',
  'CVSS Vector',
  'Resolution Date',
  'IT Owner',
  'SW Provider',
  'Critical Case',
  'Fecha comunicación SWF',
  'Certificación pedida',
  'Fecha mitigacion',
  'Fecha certificación',
];

export default function DetailSideFilterPanel({
  isOpen,
  setIsOpen,
  selectedCsirtFields,
  setSelectedCsirtFields,
  selectedCsoFields,
  setSelectedCsoFields,
}: Props) {
  const [searchCsirt, setSearchCsirt] = useState('');
  const [searchCso, setSearchCso] = useState('');

  const filteredCsirt = csirtFields.filter((f) =>
    f.toLowerCase().includes(searchCsirt.toLowerCase()),
  );
  const filteredCso = csoFields.filter((f) =>
    f.toLowerCase().includes(searchCso.toLowerCase()),
  );

  const toggleCsirt = (field: string) => {
    setSelectedCsirtFields(
      selectedCsirtFields.includes(field)
        ? selectedCsirtFields.filter((f) => f !== field)
        : [...selectedCsirtFields, field],
    );
  };

  const toggleCso = (field: string) => {
    setSelectedCsoFields(
      selectedCsoFields.includes(field)
        ? selectedCsoFields.filter((f) => f !== field)
        : [...selectedCsoFields, field],
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
        borderRight: '1px solid rgba(31, 45, 90, 0.25)',
        transition: 'width 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
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
            {/* VIT Fields */}
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
                    ),
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

            {/* VUL Fields */}
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
                    ),
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
  );
}
