// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/hooks/useColumnMap.ts
import { useMemo } from 'react';
import { VIT_MAP, VUL_MAP } from '../constants/columnMaps';

type ViewType = 'VIT' | 'VUL';

export function useColumnMap(viewType: ViewType) {
  return useMemo(() => {
    if (viewType === 'VUL') {
      return { map: VUL_MAP, allColumns: Object.keys(VUL_MAP) };
    }
    return { map: VIT_MAP, allColumns: Object.keys(VIT_MAP) };
  }, [viewType]);
}
