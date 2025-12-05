
// src/modules/Pages/Reports/Filters/Projections/Quarters.tsx
import { Box, ToggleButton } from '@mui/material';

type Props = {
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export default function Quarters({ selected, onChange, disabled = false }: Props): JSX.Element {
  const isSel = (q: string) => selected.includes(q);
  const toggle = (q: string) => {
    if (disabled) return;
    const next = isSel(q) ? selected.filter(v => v !== q) : [...selected, q];
    onChange(next);
  };

  const btnSx = {
    borderRadius: '50%',
    minWidth: 40,
    minHeight: 40,
    mx: 0.5,
    px: 0,
    '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#1976d2' },
    '&.Mui-selected:hover': { bgcolor: '#e3f2fd' },
  };

  return (
    <Box>
      <ToggleButton value="Q1" selected={isSel('Q1')} onChange={() => toggle('Q1')} size="small" sx={btnSx}>Q1</ToggleButton>
      <ToggleButton value="Q2" selected={isSel('Q2')} onChange={() => toggle('Q2')} size="small" sx={btnSx}>Q2</ToggleButton>
      <ToggleButton value="Q3" selected={isSel('Q3')} onChange={() => toggle('Q3')} size="small" sx={btnSx}>Q3</ToggleButton>
      <ToggleButton value="Q4" selected={isSel('Q4')} onChange={() => toggle('Q4')} size="small" sx={btnSx}>Q4</ToggleButton>
    </Box>
  );
}