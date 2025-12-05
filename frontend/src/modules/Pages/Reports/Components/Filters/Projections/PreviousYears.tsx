
// src/modules/Pages/Reports/Filters/Projections/PreviousYears.tsx
import { Box, ToggleButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

type Props = {
  selected: boolean;
  year: number | null;
  years: number[];
  onToggle: () => void;
  onYearChange: (value: number) => void;
};

export default function PreviousYears({ selected, year, years, onToggle, onYearChange }: Props): JSX.Element {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <ToggleButton
        value="PY"
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
        PY
      </ToggleButton>
      {selected && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="py-year-label">Año</InputLabel>
          <Select labelId="py-year-label" label="Año" value={year ?? ''} onChange={(e) => onYearChange(Number(e.target.value))}>
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
}
