
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
  const numero = String(row['numero'] ?? '');
  const activo = String(row['activo'] ?? '');
  const elementosVulnerables = String(row['elementosVulnerables'] ?? '');
  const asignadoA = String(row['asignadoA'] ?? '');
  const grupoAsignacion = String(row['grupoAsignacion'] ?? '');
  const prioridad = normalizePriority(row['prioridad']);
  const estado = String(row['estado'] ?? '');
  const actualizado = String(row['actualizado'] ?? '');
  const vits = String(row['vits'] ?? '');
  const dueDate = String(row['dueDate'] ?? '');

  const id =
    String(row['id'] ?? numero) ||
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  return {
    ...row,
    id,
    nombre: numero,
    numero,
    idExterno: numero,
    estado,
    resumen: '',
    breveDescripcion: '',
    elementoConfiguracion: '',
    fechaCreacion: '',
    prioridad,
    puntuacionRiesgo: 0,
    grupoAsignacion,
    asignadoA,
    sites: '',
    vulnerabilidad: '',
    vulnerabilitySolution: '',
    creado: '',
    actualizado,
    dueDate,
    activo,
    elementosVulnerables,
    vits,
    hasLink: Boolean(row['hasLink']) || Boolean(vits && vits.trim() !== ''),
  } as Item;
}

/* ---------- mapeo para VIT ---------- */
function mapVIT(row: Record<string, unknown>): Item {
  const numero = String(row['numero'] ?? '');
  const idExterno = String(row['idExterno'] ?? '');
  const estado = String(row['estado'] ?? '');
  const resumen = String(row['resumen'] ?? '');
  const breveDescripcion = String(row['breveDescripcion'] ?? '');
  const elementoConfiguracion = String(row['elementoConfiguracion'] ?? '');
  const direccionIp = String(row['direccionIp'] ?? '');
  const prioridad = normalizePriority(row['prioridad']);
  const puntuacionRiesgo = toNumber(row['puntuacionRiesgo']);
  const grupoAsignacion = String(row['grupoAsignacion'] ?? '');
  const asignadoA = String(row['asignadoA'] ?? '');
  const creado = String(row['creado'] ?? '');
  const actualizado = String(row['actualizado'] ?? '');
  const fechaCreacion = String(row['fechaCreacion'] ?? '');
  const dueDate = String(row['dueDate'] ?? '');
  const sites = String(row['sites'] ?? '');
  const vulnerabilidad = String(row['vulnerabilidad'] ?? '');
  const vulnerabilitySolution = String(row['vulnerabilitySolution'] ?? '');
  const comentarios = String(row['comentarios'] ?? '');
  const aplazadoPor = String(row['aplazadoPor'] ?? '');
  const fechaAplazamiento = String(row['fechaAplazamiento'] ?? '');
  const notasAplazamiento = String(row['notasAplazamiento'] ?? '');
  const softwareVulnerable = String(row['softwareVulnerable'] ?? '');
  const resolucion = String(row['resolucion'] ?? '');
  const vul = String(row['vul'] ?? row['VUL'] ?? '');

  const id =
    numero ||
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  return {
    ...row,
    id,
    nombre: resumen || breveDescripcion || numero,
    numero,
    idExterno,
    estado,
    resumen,
    breveDescripcion,
    elementoConfiguracion,
    direccionIp,
    fechaCreacion: fechaCreacion || creado,
    prioridad,
    puntuacionRiesgo,
    grupoAsignacion,
    asignadoA,
    sites,
    vulnerabilidad,
    vulnerabilitySolution,
    aplazadoPor,
    fechaAplazamiento,
    notasAplazamiento,
    softwareVulnerable,
    resolucion,
    comentarios,
    creado,
    actualizado,
    dueDate,
    hasLink: Boolean(row['hasLink']),
    vul,
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

export { mapVUL, mapVIT };
