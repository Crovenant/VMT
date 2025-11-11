import { useMemo } from 'react';
import { CSIRT_MAP, CSO_MAP } from '../constants/columnMaps';

type ViewType = 'Csirt' | 'Cso';

export function useColumnMap(viewType: ViewType) {
  return useMemo(() => {
    if (viewType === 'Cso') {
      return { map: CSO_MAP, allColumns: Object.keys(CSO_MAP) };
    }
    return { map: CSIRT_MAP, allColumns: Object.keys(CSIRT_MAP) };
  }, [viewType]);
}