//src: frontend/src/modules/Pages/Reports/Components/Charts/ChartsIndex.tsx
import { Box } from '@mui/material';
import VitRadial from './Radial/VitRadial';
import VulRadial from './Radial/VulRadial';

type Props = {
  vitTotal: number;
  vulTotal: number;
};

export default function ChartsIndex({ vitTotal, vulTotal }: Props): JSX.Element {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, width: '100%' }}>
      <VitRadial value={vitTotal} />
      <VulRadial value={vulTotal} />
    </Box>
  );
}
