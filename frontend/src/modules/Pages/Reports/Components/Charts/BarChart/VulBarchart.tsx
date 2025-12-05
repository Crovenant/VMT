
// frontend/src/modules/Pages/Reports/Components/Charts/BarChar/VulBarchart.tsx
import { Box, Typography } from '@mui/material';

type Item = { label: string; value: number };
const data: Item[] = [
  { label: 'Critical', value: 18 },
  { label: 'High', value: 31 },
  { label: 'Medium', value: 42 },
  { label: 'Low', value: 20 },
];

export default function VulBarchart(): JSX.Element {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', justifyContent: 'center' }}>
      {data.map((d) => (
        <Box key={d.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 120, textAlign: 'right' }}>
            <Typography variant="body2" sx={{ color: '#607d8b' }}>{d.label}</Typography>
          </Box>
          <Box sx={{ flex: 1, position: 'relative', height: 16, backgroundColor: '#eceff1', borderRadius: 8, overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                transformOrigin: 'left center',
                transform: `scaleX(${d.value / max})`,
                background: 'linear-gradient(90deg, #ffab91 0%, #ef5350 100%)',
              }}
            />
          </Box>
          <Box sx={{ width: 56, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ color: '#263238', fontWeight: 600 }}>{d.value}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
