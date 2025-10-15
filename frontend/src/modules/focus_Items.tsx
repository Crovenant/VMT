import { Typography, Box } from '@mui/material';
import Title from './Title';
import useItems from './hooks/useItems';

export default function CritItems({
  refreshKey,
  onFilterByFlag,
}: {
  refreshKey: number;
  onFilterByFlag: (flag: 'followUp' | 'soonDue') => void;
}) {
  const { items } = useItems(refreshKey);

  const followUpCount = items.filter(row => row.followUp).length;
  const soonDueCount = items.filter(row => row.soonDue).length;

  return (
    <>
      <Title>Overdue</Title>
      <Typography
        component="p"
        variant="h4"
        sx={{ cursor: 'pointer', color: 'error.main' }}
        onClick={() => onFilterByFlag('followUp')}
      >
        {followUpCount}
      </Typography>

      <Title>Expiring</Title>
      <Typography
        component="p"
        variant="h4"
        sx={{ cursor: 'pointer', color: 'warning.main' }}
        onClick={() => onFilterByFlag('soonDue')}
      >
        {soonDueCount}
      </Typography>
    </>
  );
}