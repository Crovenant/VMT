// src/modules/Pages/Reports/Components/Charts/radial/VulRadial.tsx
import { Box, Typography } from '@mui/material';

type Props = {
  value: number;
  max?: number;
};

export default function VulRadial({ value, max = 100 }: Props): JSX.Element {
  const safe = Math.max(0, value);
  const pct = Math.min(100, (safe / Math.max(1, max)) * 100);
  const gradient = `conic-gradient(from 135deg, #f28b82 0%, #d32f2f ${pct}%, #e0e0e0 ${pct}% 100%)`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: 180,
          aspectRatio: '1',
          borderRadius: '50%',
          background: gradient,
          position: 'relative',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: '20%',
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)',
            gap: 4,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#888' }}>
            VUL Items
          </Typography>
          <Typography variant="h5" sx={{ color: '#111', fontWeight: 700, lineHeight: 1 }}>
            {safe}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
