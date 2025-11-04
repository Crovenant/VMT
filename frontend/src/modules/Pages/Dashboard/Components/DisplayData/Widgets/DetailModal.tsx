// src/modules/Main/Components/DisplayData/Widgets/DetailModal.tsx
import { Box, Modal, Typography, Grid, Paper } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  item: {
    numero: string;
    estado: string;
    resumen: string;
    prioridad: string;
    puntuacionRiesgo: number;
    asignadoA: string;
  } | null;
};

export default function DetailModal({ open, onClose, item }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
        }}
      >
        {/* Título */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Detalle del ítem
        </Typography>

        {/* Dos columnas con datos */}
        {item && (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Número:</strong> {item.numero}</Typography>
              <Typography variant="body2"><strong>Estado:</strong> {item.estado}</Typography>
              <Typography variant="body2"><strong>Resumen:</strong> {item.resumen}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Prioridad:</strong> {item.prioridad}</Typography>
              <Typography variant="body2"><strong>Puntuación:</strong> {item.puntuacionRiesgo}</Typography>
              <Typography variant="body2"><strong>Asignado a:</strong> {item.asignadoA}</Typography>
            </Grid>
          </Grid>
        )}

        {/* Cuadro para grid relacionado */}
        <Paper
          sx={{
            mt: 3,
            height: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
          }}
        >
          Aquí irá el grid de componentes relacionados
        </Paper>
      </Box>
    </Modal>
  );
}