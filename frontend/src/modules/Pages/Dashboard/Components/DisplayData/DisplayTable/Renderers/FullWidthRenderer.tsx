import { useEffect, useRef } from 'react';
import AccordionDetail from './AccordionDetail';
import type { ICellRendererParams } from 'ag-grid-community';
import type { GridRow, DisplayRow } from '../hooks/useDisplayRows';
import type { Item } from '../../../../../../Types/item';
import { isDetailRow } from '../hooks/useDisplayRows';

export default function FullWidthRenderer({
  params,
  itemById,
}: {
  params: ICellRendererParams<GridRow>;
  itemById: Map<string, Item>;
}) {
  const d = params.data as DisplayRow | undefined;
  if (!isDetailRow(d)) return null;

  const parent = itemById.get(d.parentId);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /** ✅ Ajusta altura según el tamaño real del contenido */
  const updateHeight = () => {
    if (wrapperRef.current) {
      const newHeight = wrapperRef.current.offsetHeight;
      params.node.setRowHeight(newHeight);
      params.api.onRowHeightChanged();
    }
  };

  useEffect(() => {
    // Ajuste inicial
    updateHeight();
  }, []);

  const handleToggleLog = () => {
    // Esperamos a que el Collapse termine la animación
    setTimeout(updateHeight, 200);
  };

  return (
    <div ref={wrapperRef} className="full-width-detail-wrapper" style={{ padding: '4px 0' }}>
      <AccordionDetail item={parent} onToggleLog={handleToggleLog} />
    </div>
  );
}