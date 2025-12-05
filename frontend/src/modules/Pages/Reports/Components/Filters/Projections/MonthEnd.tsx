
// src/modules/Pages/Reports/Filters/Projections/MonthEnd.tsx
import { ToggleButton } from '@mui/material';

type Props = {
  selected: boolean;
  onToggle: () => void;
};

export default function MonthEnd({ selected, onToggle }: Props): JSX.Element {
  return (
    <ToggleButton
      value="ME"
      selected={selected}
      onChange={onToggle}
      size="small"
      sx={{
        borderRadius: '50%',
        minWidth: 40,
        minHeight: 40,
        '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#1976d2' },
        '&.Mui-selected:hover': { bgcolor: '#e3f2fd' },
      }}
    >
      ME
    </ToggleButton>
  );
}
