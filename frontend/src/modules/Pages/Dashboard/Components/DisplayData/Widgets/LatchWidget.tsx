// src/modules/Main/Components/DisplayData/LatchWidget.tsx
import { Box } from '@mui/material';

type Props = {
  viewType: 'Csirt' | 'Cso';
  onSwitchView: (type: 'Csirt' | 'Cso') => void;
};

export default function LatchWidget({ viewType, onSwitchView }: Props) {
  const isCsirt = viewType === 'Csirt';

  const handleToggle = () => {
    onSwitchView(isCsirt ? 'Cso' : 'Csirt');
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
      }}
      onClick={handleToggle}
    >
      {/* Texto */}
      <Box sx={{ width: '50%', textAlign: 'center', zIndex: 1, color: isCsirt ? '#fff' : '#333' }}>
        Csirt
      </Box>
      <Box sx={{ width: '50%', textAlign: 'center', zIndex: 1, color: !isCsirt ? '#fff' : '#333' }}>
        Cso
      </Box>

      {/* Indicador */}
      <Box
        sx={{
          position: 'absolute',
          top: 2,
          left: isCsirt ? 2 : 'calc(50% + 2px)',
          width: 'calc(55% - 3px)',
          height: '24px',
          backgroundColor: '#008cffff', // Verde oscuro
          borderRadius: 'px',
          transition: 'left 0.3s ease',
          zIndex: 0,
        }}
      />
    </Box>
  );
}