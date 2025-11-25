
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Radio
} from '@mui/material';

type RelationChange = {
  vulNumero: string;
  vitNumero: string;
  before: string;
  after: string;
};

interface Props {
  open: boolean;
  relations: RelationChange[];
  selectedOptions: ('apply' | 'ignore')[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<('apply' | 'ignore')[]>>;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RelationResolverModal({
  open,
  relations,
  selectedOptions,
  setSelectedOptions,
  onConfirm,
  onCancel
}: Props) {
  const handleChange = (index: number, value: 'apply' | 'ignore') => {
    const updated = [...selectedOptions];
    updated[index] = value;
    setSelectedOptions(updated);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar relaciones VIT ↔ VUL</DialogTitle>
      <DialogContent dividers>
        {relations.map((rel, idx) => {
          const beforeList = rel.before ? rel.before.split(',') : [];
          const afterList = rel.after ? rel.after.split(',') : [];
          const added = afterList.filter(v => !beforeList.includes(v));

          return (
            <Box key={idx} mb={2} p={1} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
              {/* Línea explicativa */}
              <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: '#444' }}>
                La VIT <strong>{rel.vitNumero}</strong> se añadirá a la VUL <strong>{rel.vulNumero}</strong>.
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                VUL: {rel.vulNumero}
              </Typography>
              <Typography variant="body2">Antes: {beforeList.join(', ') || '(vacío)'}</Typography>
              <Typography variant="body2">
                Después:{' '}
                {afterList.map(v =>
                  added.includes(v) ? (
                    <span key={v} style={{ color: 'red', fontWeight: 'bold' }}>{v}</span>
                  ) : (
                    <span key={v}>{v}</span>
                  )
                )}
              </Typography>

              {/* Radios para aplicar/ignorar */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <FormControlLabel
                  value="apply"
                  control={
                    <Radio
                      checked={selectedOptions[idx] === 'apply'}
                      onChange={() => handleChange(idx, 'apply')}
                    />
                  }
                  label="Aplicar esta relación"
                />
                <FormControlLabel
                  value="ignore"
                  control={
                    <Radio
                      checked={selectedOptions[idx] === 'ignore'}
                      onChange={() => handleChange(idx, 'ignore')}
                    />
                  }
                  label="Ignorar esta relación"
                />
              </Box>
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">Cancelar</Button>
        <Button onClick={onConfirm} color="primary" variant="contained">Confirmar selección</Button>
      </DialogActions>
    </Dialog>
  );
}
