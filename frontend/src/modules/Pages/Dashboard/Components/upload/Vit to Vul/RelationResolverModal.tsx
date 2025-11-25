
// src/modules/Pages/Dashboard/Components/upload/Vit to Vul/RelationResolverModal.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';

type RelationChange = {
  vulNumero: string;
  vitNumero: string;
  before: string;
  after: string;
};

interface Props {
  open: boolean;
  relations: RelationChange[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RelationResolverModal({ open, relations, onConfirm, onCancel }: Props) {
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
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">Cancelar</Button>
        <Button onClick={onConfirm} color="primary" variant="contained">Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
}
