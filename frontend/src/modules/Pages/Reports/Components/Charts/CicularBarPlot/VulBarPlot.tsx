
// frontend/src/modules/Pages/Reports/Components/Charts/BarChar/VulBarchar.tsx
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import CicularBarPlot from './CircularBarPlotChart';

export default function VulBarchar(): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState<number>(540);
  const [h, setH] = useState<number>(300);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const cw = el.clientWidth;
      const ch = el.clientHeight || 300;
      setW(Math.max(320, cw));
      setH(Math.max(240, ch));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <Box ref={ref} sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CicularBarPlot width={w} height={h} />
    </Box>
  );
}
