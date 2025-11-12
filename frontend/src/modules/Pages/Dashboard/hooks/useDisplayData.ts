// src/modules/Pages/Dashboard/hooks/useDisplayData.ts
import { useEffect, useState } from 'react';
import type { Item } from '../../../Types/item';

type ViewType = 'VIT' | 'VUL';

function norm(s: unknown) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
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

function mapVUL(row: Record<string, unknown>): Item {
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
  const dueDate = pick(row, ['Due date', 'Due Date', 'dueDate']);

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
    dueDate,
    vulnerabilityId: String((row['Vulnerability ID'] as string) ?? ''),
    state: String((row['State'] as string) ?? (row['State CSO'] as string) ?? ''),
    severity: String((row['Severity'] as string) ?? ''),
    vulCode: String((row['VUL Code'] as string) ?? ''),
    vitCode: String((row['VIT Code'] as string) ?? ''),
  } as Item;
}

function mapVIT(row: Record<string, unknown>): Item {
  const prioridad = normalizePriority(row['prioridad']);
  const creado = String((row['creado'] as string) ?? '');
  const actualizado = String((row['actualizado'] as string) ?? '');
  const rawDue = row['dueDate'];
  const dueDate = typeof rawDue === 'string' ? rawDue : '';

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
    fechaCreacion: String((row['fechaCreacion'] as string) ?? creado),
    prioridad,
    puntuacionRiesgo: toNumber((row['puntuacionRiesgo'] as number) ?? (row['riesgo'] as number)),
    grupoAsignacion: String((row['grupoAsignacion'] as string) ?? ''),
    asignadoA: String((row['asignadoA'] as string) ?? ''),
    sites: String((row['sites'] as string) ?? ''),
    vulnerabilidad: String((row['vulnerabilidad'] as string) ?? ''),
    vulnerabilitySolution: String((row['vulnerabilitySolution'] as string) ?? ''),
    creado,
    actualizado,
    dueDate,
  } as Item;
}

function extractArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.results)) return o.results;
  }
  return [];
}

function isAbortError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { name?: string }).name === 'AbortError';
}

export default function useDisplayData({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  viewType,
  listUrl,
}: {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null;
  viewType: ViewType;
  listUrl: string;
}) {
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(true);
  const [rows, setRows] = useState<Item[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(listUrl, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = (await res.json()) as unknown;
        const array = extractArray(raw);

        const mapped: Item[] = array.map((entry) => {
          const row = entry as Record<string, unknown>;
          return viewType === 'VUL' ? mapVUL(row) : mapVIT(row);
        });

        const msPerDay = 1000 * 60 * 60 * 24;
        const now = new Date();
        const horizonDaysByPriority: Record<Item['prioridad'], number> = {
          Crítico: 30,
          Alto: 90,
          Medio: 365,
          Bajo: 365,
        };

        const withFlags = mapped.map((it) => {
          const due = it.dueDate ? new Date(it.dueDate) : null;
          if (due && !Number.isNaN(due.getTime())) {
            const days = Math.floor((due.getTime() - now.getTime()) / msPerDay);
            return { ...it, followUp: days < 0, soonDue: days >= 0 && days <= 7 };
          }
          const created = new Date(it.fechaCreacion);
          if (Number.isNaN(created.getTime())) return { ...it, followUp: false, soonDue: false };
          const horizonDays = horizonDaysByPriority[it.prioridad] ?? 365;
          const expiry = new Date(created.getTime() + horizonDays * msPerDay);
          const days = Math.floor((expiry.getTime() - now.getTime()) / msPerDay);
          return { ...it, followUp: days < 0, soonDue: days >= 0 && days <= 7 };
        });

        let filtered = withFlags;
        if (selectedItemId) {
          const needle = String(selectedItemId);
          filtered = filtered.filter((r) => String(r.id) === needle);
        } else if (priorityFilter) {
          filtered = filtered.filter((r) => r.prioridad === priorityFilter);
        } else if (customFlagFilter === 'followUp') {
          filtered = filtered.filter((r) => r.followUp);
        } else if (customFlagFilter === 'soonDue') {
          filtered = filtered.filter((r) => r.soonDue);
        }

        setRows(filtered);
      } catch (err: unknown) {
        if (!isAbortError(err)) {
          console.error(`[${viewType}] fetch error:`, err);
          setRows([]);
        }
      }
    })();
    return () => ctrl.abort();
  }, [refreshKey, priorityFilter, selectedItemId, customFlagFilter, viewType, listUrl]);

  const handleDownload = () => {
    if (typeof window.exportFilteredDataToExcel === 'function') {
      window.exportFilteredDataToExcel();
    }
  };

  return {
    rows,
    showFilterPanel,
    setShowFilterPanel,
    handleDownload,
  };
}
