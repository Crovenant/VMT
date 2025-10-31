import React from 'react';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

interface TitleProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export default function TitleWrapper({ children, sx }: TitleProps) {
  return (
    <Typography
      component="h2"
      variant="h6"
      color="primary"
      sx={{ margin: 0, ...sx }}
    >
      {children}
    </Typography>
  );
}
