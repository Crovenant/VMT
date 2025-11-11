import { Box } from '@mui/material';

type ViewType = 'VIT' | 'VUL';

type Props = {
  viewType: ViewType;
  onSwitchView: (type: ViewType) => void;
};

export default function LatchWidget({ viewType, onSwitchView }: Props) {
  const isVIT = viewType === 'VIT';

  const handleToggle = () => {
    onSwitchView(isVIT ? 'VUL' : 'VIT');
  };

  return (
    <Box
      sx={{
        width: 70,
        height: 28,
        borderRadius: '14px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 500,
        overflow: 'hidden',
        userSelect: 'none',
      }}
      onClick={handleToggle}
    >
      {/* Texto */}
      <Box sx={{ width: '50%', textAlign: 'center', zIndex: 1, color: isVIT ? '#fff' : '#333' }}>
        VIT
      </Box>
      <Box sx={{ width: '50%', textAlign: 'center', zIndex: 1, color: !isVIT ? '#fff' : '#333' }}>
        VUL
      </Box>

      {/* Indicador */}
      <Box
        sx={{
          position: 'absolute',
          top: 2,
          left: isVIT ? 2 : 'calc(50% + 2px)',
          width: 'calc(50% - 4px)',
          height: '24px',
          backgroundColor: '#1976d2',
          borderRadius: '12px',
          transition: 'left 0.25s ease',
          zIndex: 0,
        }}
      />
    </Box>
  );
}
