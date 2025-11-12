// src/modules/Shared/hooks/useItems.ts
import { useEffect, useState } from 'react';
import type { Item } from '../../Types/item';

type ViewType = 'Csirt' | 'Cso';

const DEFAULT_Csirt_LIST = 'http://localhost:8000/vit/risk-data/';

function norm(s: unknown) {
  return String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

function normalizePriority(p: unknown): Item['prioridad'] {
  const v = norm(p);
  if (v.startsWith('crit')) return 'Crítico';
  if (v.startsWith('high') || v.startsWith('alt')) return 'Alto';
  if (v.startsWith('med')) return 'Medio';
  if (v.startsWith('low') || v.startsWith('baj')) return 'Bajo';
  return 'Medio';
}

function toNumber(n: unknown): number {
  if (n === null || n === undefined || n === '') return 0;
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pick(obj: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
  }
  return fallback;
}

/* ---------- mapeos ---------- */

function CsoToItem(row: Record<string, unknown>): Item {
  const numero = pick(row, ['Vulnerability ID', 'ID Test', 'VUL Code', 'VIT Code']);
  const resumen = pick(row, ['Vulnerability Title', 'Threat Description', 'Details']);
  const estado = pick(row, ['State', 'State CSO']);
  const prioridad = normalizePriority(pick(row, ['Severity']));
  const puntuacionRiesgo =
    toNumber(row['CVSS Overall']) || toNumber(row['CVSS Base']) || toNumber(row['EPSS']);
  const asignadoA = pick(row, ['IT Owner', 'Detection team', 'SW Provider']);
  const elementoConfiguracion = pick(row, ['Hostname', 'Application', 'Nombre Aplicación']);
  const creado = pick(row, ['Detection Date', 'Actualizacion estado', 'Fecha comunicación SWF']);
  const actualizado = pick(row, ['Resolution Date', 'Production Date', 'Fecha mitigacion']);

  const id =
    numero ||
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  return {
    id: String(id),
    nombre: resumen,
    numero: String(numero),
    idExterno: String(numero),
    estado: String(estado),
    resumen: String(resumen),
    breveDescripcion: '',
    elementoConfiguracion: String(elementoConfiguracion),
    fechaCreacion: String(creado),
    prioridad,
    puntuacionRiesgo,
    grupoAsignacion: '',
    asignadoA: String(asignadoA),
    sites: pick(row, ['Domain', 'Network']),
    vulnerabilidad: pick(row, ['Category ASVS', 'ASVS ID', 'OWASP TOP 10']),
    vulnerabilitySolution: String((row['Countermeasure'] as string) ?? ''),
    creado: String(creado),
    actualizado: String(actualizado),
  } as Item;
}

function CsirtToItem(row: Record<string, unknown>): Item {
  const id =
    (row['id'] as string) ??
    (row['numero'] as string) ??
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  return {
    id: String(id),
    nombre: String((row['nombre'] as string) ?? (row['resumen'] as string) ?? ''),
    numero: String((row['numero'] as string) ?? ''),
    idExterno: String((row['idExterno'] as string) ?? ''),
    estado: String((row['estado'] as string) ?? ''),
    resumen: String((row['resumen'] as string) ?? ''),
    breveDescripcion: String((row['breveDescripcion'] as string) ?? ''),
    elementoConfiguracion: String((row['elementoConfiguracion'] as string) ?? ''),
    fechaCreacion: String((row['fechaCreacion'] as string) ?? (row['creado'] as string) ?? ''),
    prioridad: normalizePriority(row['prioridad']),
    puntuacionRiesgo: toNumber(row['puntuacionRiesgo']),
    grupoAsignacion: String((row['grupoAsignacion'] as string) ?? ''),
    asignadoA: String((row['asignadoA'] as string) ?? ''),
    sites: String((row['sites'] as string) ?? ''),
    vulnerabilidad: String((row['vulnerabilidad'] as string) ?? ''),
    vulnerabilitySolution: String((row['vulnerabilitySolution'] as string) ?? ''),
    creado: String((row['creado'] as string) ?? ''),
    actualizado: String((row['actualizado'] as string) ?? ''),
  } as Item;
}

/* ---------- flags (followUp / soonDue) ---------- */

function computeFlags(items: Item[]): Item[] {
  const msPerDay = 1000 * 60 * 60 * 24;
  const horizonDaysByPriority: Record<Item['prioridad'], number> = {
    Crítico: 30,
    Alto: 90,
    Medio: 365,
    Bajo: 365,
  };
  const now = new Date();

  return items.map((item) => {
    const created = new Date(item.fechaCreacion);
    if (isNaN(created.getTime())) return { ...item, followUp: false, soonDue: false };

    const horizonDays = horizonDaysByPriority[item.prioridad] ?? 365;
    const expiry = new Date(created.getTime() + horizonDays * msPerDay);
    const daysToExpiry = Math.floor((expiry.getTime() - now.getTime()) / msPerDay);
    const followUp = daysToExpiry < 0;
    const soonDue = !followUp && daysToExpiry <= 7;

    return { ...item, followUp, soonDue };
  });
}

/* ---------- HOOK ---------- */
export default function useItems(
  refreshKey: number,
  listUrl?: string,
  viewType: ViewType = 'Csirt'
): { items: Item[] } {
  const [items, setItems] = useState<Item[]>([]);

  const effectiveList = listUrl ?? DEFAULT_Csirt_LIST;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(effectiveList);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = (await res.json()) as unknown;

        const arr: unknown[] = Array.isArray(raw) ? raw : [];
        const mapped =
          viewType === 'Cso'
            ? (arr ?? []).map((r) => CsoToItem(r as Record<string, unknown>))
            : (arr ?? []).map((r) => CsirtToItem(r as Record<string, unknown>));

        const withFlags = computeFlags(mapped);
        if (!cancelled) setItems(withFlags);
      } catch (err) {
        console.error('Error fetching items:', err);
        if (!cancelled) setItems([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, effectiveList, viewType]);

  return { items };
}
