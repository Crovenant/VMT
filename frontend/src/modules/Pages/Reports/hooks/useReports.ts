// src: frontend/src/modules/Pages/Reports/hooks/useReports.ts
import { useMemo } from 'react';

export default function useReports() {
  const vitTotal = useMemo(() => 75, []);
  const vulTotal = useMemo(() => 62, []);
  return { vitTotal, vulTotal };
}
