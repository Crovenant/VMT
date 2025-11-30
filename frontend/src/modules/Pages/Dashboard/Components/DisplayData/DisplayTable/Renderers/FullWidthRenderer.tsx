//src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/Renderers/FullWidthRenderer.tsx
import { useEffect, useRef } from 'react';
import AccordionDetail from './AccordionDetail';
import type { ICellRendererParams } from 'ag-grid-community';
import type { GridRow, DisplayRow } from '../hooks/useDisplayRows';
import type { Item } from '../../../../../../Types/item';
import { isDetailRow } from '../hooks/useDisplayRows';

type ViewType = 'VIT' | 'VUL';

export default function FullWidthRenderer({
  params,
  itemById,
  viewType,
}: {
  params: ICellRendererParams<GridRow>;
  itemById: Map<string, Item>;
  viewType: ViewType;
}) {
  const d = params.data as DisplayRow | undefined;
  if (!isDetailRow(d)) return null;

  const parent = itemById.get(d.parentId);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const updateHeight = () => {
    if (wrapperRef.current) {
      const newHeight = wrapperRef.current.offsetHeight;
      params.node.setRowHeight(newHeight);
      params.api.onRowHeightChanged();
    }
  };

  useEffect(() => {
    updateHeight();
  }, []);

  const handleToggleLog = () => {
    setTimeout(updateHeight, 200);
  };

  const handleContentSizeChange = () => {
    setTimeout(updateHeight, 0);
  };

  return (
    <div ref={wrapperRef} className="full-width-detail-wrapper" style={{ padding: '4px 0' }}>
      <AccordionDetail
        item={parent}
        onToggleLog={handleToggleLog}
        viewType={viewType}
        onSizeChange={handleContentSizeChange}
      />
    </div>
  );
}
