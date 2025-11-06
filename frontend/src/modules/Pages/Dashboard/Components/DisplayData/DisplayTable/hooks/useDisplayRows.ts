import type { Item } from '../../../../../../Types/item';

export type DetailRow = { _kind: 'detail'; parentId: string };
export type DisplayRow = Item | DetailRow;
export type GridRow = Record<string, unknown>;

export function isDetailRow(r: DisplayRow | undefined): r is DetailRow {
  return !!r && (r as DetailRow)._kind === 'detail';
}

export function getRowKey(r: DisplayRow): string {
  if (isDetailRow(r)) return `detail:${r.parentId}`;
  const it = r as Item;
  return String(it.id ?? it.numero);
}

export function buildDisplayRows(items: Item[], expanded: Set<string>): DisplayRow[] {
  const out: DisplayRow[] = [];
  for (const it of items) {
    out.push(it);
    const pid = String(it.id ?? it.numero);
    if (expanded.has(pid)) out.push({ _kind: 'detail', parentId: pid });
  }
  return out;
}