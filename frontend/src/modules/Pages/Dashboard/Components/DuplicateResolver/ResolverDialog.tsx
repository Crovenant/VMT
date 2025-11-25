
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  FormControlLabel,
  Radio
} from '@mui/material';
import type { DuplicatePair } from '../../../../Types/item';
import { renderEntry } from './ResolverLogic';

interface Props {
  open: boolean;
  duplicates: DuplicatePair[];
  selectedOptions: ('existing' | 'incoming')[];
  handleChange: (index: number, value: 'existing' | 'incoming') => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResolverDialog({
  open,
  duplicates,
  selectedOptions,
  handleChange,
  onClose,
  onConfirm
}: Props) {
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
                {renderEntry(pair.existing, pair.incoming)}
              </Box>
              <Box sx={{ flex: 1, border: '1px solid #ccc', p: 1 }}>
                <Typography variant="caption">New Item data</Typography>
                {renderEntry(pair.incoming, pair.existing)}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Box sx={{ flex: 1 }}>
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
              <Box sx={{ flex: 1 }}>
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
}
