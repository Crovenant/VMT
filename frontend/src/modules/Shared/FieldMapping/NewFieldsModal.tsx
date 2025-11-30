
// src/modules/Shared/FieldMapping/NewFieldsModal.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

type Props = {
  open: boolean;
  newFields: string[];
  headers: string[];
  onConfirm: () => void;
  onCancel: () => void;
};

export default function NewFieldsModal({ open, newFields, headers, onConfirm, onCancel }: Props) {
  const getContext = (field: string) => {
    const index = headers.findIndex(h => h === field);
    if (index === -1) return [field];
    const start = Math.max(0, index - 2);
    const end = Math.min(headers.length, index + 3);
    return headers.slice(start, end);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>New Field Detected</DialogTitle>
      <DialogContent>
        {newFields.map((field, idx) => {
          const context = getContext(field);
          return (
            <Box key={idx} sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Do you wish to add this new field?:{' '}
                <Typography component="span" sx={{ fontWeight: 'bold', color: 'red' }}>
                  {field}
                </Typography>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {context.map((h, i) => (
                  <Typography
                    key={i}
                    sx={{
                      fontWeight: h === field ? 'bold' : 'normal',
                      color: h === field ? 'red' : 'inherit'
                    }}
                  >
                    {i > 0 ? '|' : ''} {h}
                  </Typography>
                ))}
              </Box>
            </Box>
          );
        })}
        <Typography variant="body2" sx={{ mt: 2, color: 'red', fontWeight: 'bold' }}>
          *This action cannot be undone. Do you wish to proceed?*
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">Cancel</Button>
        <Button onClick={onConfirm} color="primary" variant="contained">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
