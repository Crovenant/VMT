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
  return (
    <div className="full-width-detail-wrapper">
      <AccordionDetail item={parent} />
    </div>
  );
}