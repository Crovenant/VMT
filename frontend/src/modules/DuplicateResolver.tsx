import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Divider
} from '@mui/material';

interface Entry {
  [key: string]: any;
}

interface DuplicatePair {
  existing: Entry;
  incoming: Entry;
}

interface Props {
  open: boolean;
  duplicates: DuplicatePair[];
  selectedOptions: ('existing' | 'incoming')[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<('existing' | 'incoming')[]>>;
  onClose: () => void;
  onConfirm: () => void;
}

const fieldLabels: { [key: string]: string } = {
  numero: "Número",
  idExterno: "ID externo",
  estado: "Estado",
  resumen: "Resumen",
  breveDescripcion: "Breve descripción",
  elementoConfiguracion: "Elemento de configuración",
  prioridad: "Prioridad",
  puntuacionRiesgo: "Puntuación de riesgo",
  grupoAsignacion: "Grupo de asignación",
  asignadoA: "Asignado a",
  creado: "Creado",
  actualizado: "Actualizado",
  sites: "Sites",
  vulnerabilitySolution: "Vulnerability solution",
  vulnerabilidad: "Vulnerabilidad"
};

const DuplicateResolver: React.FC<Props> = ({
  open,
  duplicates,
  selectedOptions,
  setSelectedOptions,
  onClose,
  onConfirm
}) => {
  const handleChange = (index: number, value: 'existing' | 'incoming') => {
    const updated = [...selectedOptions];
    updated[index] = value;
    setSelectedOptions(updated);
    console.log(`🔘 Selección actualizada en índice ${index}:`, value);
  };

  const renderEntry = (entry: Entry) => (
    <Box sx={{ fontSize: 12, lineHeight: 1.4 }}>
      {Object.entries(fieldLabels).map(([key, label]) => (
        <Typography key={key} variant="body2">
          <strong>{label}:</strong> {String(entry[key] ?? '')}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Conflicts detected</DialogTitle>
      <DialogContent dividers>
        {duplicates.map((pair, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Existing ID found #{index + 1}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1, border: '1px solid #ccc', p: 1 }}>
                <Typography variant="caption">Registered Item data</Typography>
                {renderEntry(pair.existing)}
              </Box>
              <Box sx={{ flex: 1, border: '1px solid #ccc', p: 1 }}>
                <Typography variant="caption">New Item data</Typography>
                {renderEntry(pair.incoming)}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <FormControlLabel
                  value="existing"
                  control={
                    <Radio
                      checked={selectedOptions[index] === 'existing'}
                      onChange={() => handleChange(index, 'existing')}
                    />
                  }
                  label="Keep current data"
                />
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <FormControlLabel
                  value="incoming"
                  control={
                    <Radio
                      checked={selectedOptions[index] === 'incoming'}
                      onChange={() => handleChange(index, 'incoming')}
                    />
                  }
                  label="Rewrite with new data"
                />
              </Box>
            </Box>

            <Divider sx={{ mt: 3 }} />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>
          Confirm selection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DuplicateResolver;