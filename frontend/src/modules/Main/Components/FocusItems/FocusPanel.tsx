import { Box, Chip } from '@mui/material';

export default function FocusPanel({
  followUpCount,
  soonDueCount,
  onFilterByFlag,
}: {
  followUpCount: number;
  soonDueCount: number;
  onFilterByFlag: (flag: 'followUp' | 'soonDue') => void;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="center"
      sx={{ height: '140px', gap: 3 }} // altura más generosa + separación mayor
    >
      <Chip
        label={`Follow-up: ${followUpCount}`}
        color="error"
        clickable
        onClick={() => onFilterByFlag('followUp')}
        sx={{ fontSize: '1rem', px: 2 }}
      />
      <Chip
        label={`Expiring: ${soonDueCount}`}
        color="warning"
        clickable
        onClick={() => onFilterByFlag('soonDue')}
        sx={{ fontSize: '1rem', px: 2 }}
      />
    </Box>
  );
}