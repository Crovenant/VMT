import { useEffect, useState } from 'react';
import type { Item } from '../../../Types/item';
// ⬇️ Importamos el mapa de columnas para poder rellenar TODOS los campos de SOUP
import { SOUP_MAP } from '../Components/DisplayData/DisplayTable/constants/columnMaps';

type ViewType = 'Tshirt' | 'Soup';

/* ======================================================================
   Helpers
====================================================================== */
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

/* ======================================================================
   Mapeadores
====================================================================== */
/** Mapea una fila SOUP a tu modelo Item (genérico: rellena TODO el SOUP_MAP) */
function soupToItem(row: Record<string, unknown>): Item {
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

  // 1) Base mínimo para que el UI funcione
  const base: Partial<Item> = {
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
    vulnerabilitySolution: String(row['Countermeasure'] ?? ''),
    creado: String(creado),
    actualizado: String(actualizado),
    dueDate,

    // Campos que seguro usas como mínimos por defecto
    vulnerabilityId: String(row['Vulnerability ID'] ?? ''),
    state: String(row['State'] ?? row['State CSO'] ?? ''),
    severity: String(row['Severity'] ?? ''),
    vulCode: String(row['VUL Code'] ?? ''),
    vitCode: String(row['VIT Code'] ?? ''),
  };

  // 2) Relleno genérico: para CADA encabezado de SOUP_MAP, si existe en la fila
  //    lo copio a la clave de Item correspondiente, sin machacar si ya hay valor.
  for (const [header, itemKey] of Object.entries(SOUP_MAP)) {
    const raw = row[header as keyof typeof row];
    if (raw === undefined || raw === null) continue;

    const key = itemKey as keyof Item;
    const current = (base as any)[key];
    const next = String(raw);

    if (current === undefined || current === null || String(current) === '') {
      (base as any)[key] = next;
    }
  }

  return base as Item;
}

/** TSHIRT ya viene casi alineado con Item; normalizamos y rellenamos huecos */
function tshirtToItem(row: Record<string, unknown>): Item {
  const prioridad = normalizePriority(row['prioridad']);
  const creado = String(row['creado'] ?? '');
  const actualizado = String(row['actualizado'] ?? '');
  const dueDate = String((row as any)['dueDate'] ?? '');

  const id =
    row['id'] ??
    row['numero'] ??
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  return {
    id: String(id),
    nombre: String(row['nombre'] ?? row['resumen'] ?? ''),
    numero: String(row['numero'] ?? ''),
    idExterno: String(row['idExterno'] ?? ''),
    estado: String(row['estado'] ?? ''),
    resumen: String(row['resumen'] ?? ''),
    breveDescripcion: String(row['breveDescripcion'] ?? ''),
    elementoConfiguracion: String(row['elementoConfiguracion'] ?? ''),
    fechaCreacion: String(row['fechaCreacion'] ?? creado),
    prioridad,
    puntuacionRiesgo: toNumber(row['puntuacionRiesgo'] ?? row['riesgo']),
    grupoAsignacion: String(row['grupoAsignacion'] ?? ''),
    asignadoA: String(row['asignadoA'] ?? ''),
    sites: String(row['sites'] ?? ''),
    vulnerabilidad: String(row['vulnerabilidad'] ?? ''),
    vulnerabilitySolution: String(row['vulnerabilitySolution'] ?? ''),
    creado,
    actualizado,
    dueDate,
  } as Item;
}

/* ======================================================================
   Hook principal
====================================================================== */
export default function useDisplayData({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
  viewType,         // 'Tshirt' | 'Soup'
  listUrl,          // endpoint según vista
}: {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null;
  viewType: ViewType;
  listUrl: string;
}) {
  // deja el panel visible por defecto (si lo quieres oculto, pon false)
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(true);
  const [rows, setRows] = useState<Item[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      try {
        const res = await fetch(listUrl, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = (await res.json()) as unknown;

        // soporta tanto [] como {data:[...]} o {results:[...]}
        const array: unknown[] =
          Array.isArray(raw)
            ? raw
            : Array.isArray((raw as any)?.data)
            ? (raw as any).data
            : Array.isArray((raw as any)?.results)
            ? (raw as any).results
            : [];

        const mapped: Item[] = array.map((entry) => {
          const row = entry as Record<string, unknown>;
          return viewType === 'Soup' ? soupToItem(row) : tshirtToItem(row);
        });

        // flags followUp / soonDue
        const msPerDay = 1000 * 60 * 60 * 24;
        const now = new Date();
        const horizonDaysByPriority: Record<Item['prioridad'], number> = {
          Crítico: 30,
          Alto: 90,
          Medio: 365,
          Bajo: 365,
        };

        const withFlags = mapped.map((it) => {
          // 1) dueDate manda si es válido
          const due = it.dueDate ? new Date(it.dueDate) : null;
          if (due && !Number.isNaN(due.getTime())) {
            const days = Math.floor((due.getTime() - now.getTime()) / msPerDay);
            return { ...it, followUp: days < 0, soonDue: days >= 0 && days <= 7 };
          }
          // 2) si no hay dueDate, derivar desde fechaCreacion + prioridad
          const created = new Date(it.fechaCreacion);
          if (Number.isNaN(created.getTime())) return { ...it, followUp: false, soonDue: false };
          const horizonDays = horizonDaysByPriority[it.prioridad] ?? 365;
          const expiry = new Date(created.getTime() + horizonDays * msPerDay);
          const days = Math.floor((expiry.getTime() - now.getTime()) / msPerDay);
          return { ...it, followUp: days < 0, soonDue: days >= 0 && days <= 7 };
        });

        // filtros opcionales (en el mismo orden que usabas)
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
      } catch (err) {
        if ((err as any)?.name !== 'AbortError') {
          console.error(`[${viewType}] fetch error:`, err);
          setRows([]);
        }
      }
    })();

    return () => ctrl.abort();
  }, [refreshKey, priorityFilter, selectedItemId, customFlagFilter, viewType, listUrl]);

  // Mantengo API previa por compatibilidad con tu FilterBar/Wrapper
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
