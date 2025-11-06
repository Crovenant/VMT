import { useMemo } from 'react';
import { TSHIRT_MAP, SOUP_MAP } from '../constants/columnMaps';

type ViewType = 'Tshirt' | 'Soup';

export function useColumnMap(viewType: ViewType) {
  return useMemo(() => {
    if (viewType === 'Soup') {
      return { map: SOUP_MAP, allColumns: Object.keys(SOUP_MAP) };
    }
    return { map: TSHIRT_MAP, allColumns: Object.keys(TSHIRT_MAP) };
  }, [viewType]);
}