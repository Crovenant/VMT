
// src/modules/Pages/Reports/Filters/FiltersIndex.tsx
import { useMemo, useState } from 'react';
import { Box, Stack } from '@mui/material';
import Quarters from './Projections/Quarters';
import MonthEnd from './Projections/MonthEnd';
import YearEnd from './Projections/YearEnd';
import PreviousYears from './Projections/PreviousYears';

export default function FiltersIndex(): JSX.Element {
  const [quarters, setQuarters] = useState<string[]>([]);
  const [monthEnd, setMonthEnd] = useState<boolean>(false);
  const [yearEnd, setYearEnd] = useState<boolean>(false);
  const [previousYears, setPreviousYears] = useState<boolean>(false);
  const [pyYear, setPyYear] = useState<number | null>(null);

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 1, y - 2, y - 3];
  }, []);

  const handleQuartersChange = (next: string[]) => {
    setQuarters(next);
    if (next.length > 0) {
      setMonthEnd(false);
      setYearEnd(false);
      setPreviousYears(false);
      setPyYear(null);
    }
  };

  const toggleMonthEnd = () => {
    const next = !monthEnd;
    setMonthEnd(next);
    if (next) {
      setYearEnd(false);
      setPreviousYears(false);
      setPyYear(null);
      setQuarters([]);
    }
  };

  const toggleYearEnd = () => {
    const next = !yearEnd;
    setYearEnd(next);
    if (next) {
      setMonthEnd(false);
      setPreviousYears(false);
      setPyYear(null);
      setQuarters([]);
    }
  };

  const togglePreviousYears = () => {
    const next = !previousYears;
    setPreviousYears(next);
    if (next) {
      setMonthEnd(false);
      setYearEnd(false);
      setQuarters([]);
    } else {
      setPyYear(null);
    }
  };

  const handlePyYearChange = (value: number) => {
    setPyYear(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        sx={{ width: '100%' }}
      >
        <Quarters selected={quarters} onChange={handleQuartersChange} />
        <MonthEnd selected={monthEnd} onToggle={toggleMonthEnd} />
        <YearEnd selected={yearEnd} onToggle={toggleYearEnd} />
        <PreviousYears
          selected={previousYears}
          year={pyYear}
          years={yearOptions}
          onToggle={togglePreviousYears}
          onYearChange={handlePyYearChange}
        />
      </Stack>
    </Box>
  );
}
