// frontend/src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/GridComponents/components/DeleteSelection.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface DeleteSelectionProps {
  open: boolean;
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteSelection({ open, selectedCount, onConfirm, onCancel }: DeleteSelectionProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">
          {selectedCount === 1
            ? '¿Seguro que deseas eliminar la fila seleccionada?'
            : `¿Seguro que deseas eliminar las ${selectedCount} filas seleccionadas?`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
