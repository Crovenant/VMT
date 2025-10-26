// src/components/TitleWrapper.tsx

import React from 'react';
import Typography from '@mui/material/Typography';

interface TitleProps {
  children: React.ReactNode;
}

export default function TitleWrapper({ children }: TitleProps) {
  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {children}
    </Typography>
  );
}