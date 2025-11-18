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
  const numero = pick(row, ['Número']);
  const activo = pick(row, ['Activo']);
  const elementosVulnerables = pick(row, ['Elementos vulnerables']);
  const asignadoA = pick(row, ['Asignado a']);
  const grupoAsignacion = pick(row, ['Grupo de asignación']);
  const prioridad = normalizePriority(pick(row, ['Prioridad']));
  const estado = pick(row, ['Estado']);
  const actualizado = pick(row, ['Actualizado']);
  const vits = pick(row, ['VITS']);

  const id =
    pick(row, ['id']) ||
    numero ||
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  return {
    id: String(id),
    nombre: numero,
    numero: String(numero),
    idExterno: String(numero),
    estado: String(estado),
    resumen: '',
    breveDescripcion: '',
    elementoConfiguracion: '',
    fechaCreacion: '',
    prioridad,
    puntuacionRiesgo: 0,
    grupoAsignacion: String(grupoAsignacion),
    asignadoA: String(asignadoA),
    sites: '',
    vulnerabilidad: '',
    vulnerabilitySolution: '',
    creado: '',
    actualizado: String(actualizado),
    dueDate: '',
    activo: String(activo),
    elementosVulnerables: String(elementosVulnerables),
    vits: String(vits),
    hasLink: Boolean(row.hasLink) || Boolean(vits && vits.trim() !== ''), // ✅ ojo en VUL si hay VITS
  } as Item;
}

function mapVIT(row: Record<string, unknown>): Item {
  const numero = pick(row, ['numero', 'Número', 'Num', 'number', 'id']);
  const idExterno = pick(row, ['idExterno', 'ID externo', 'externalId', 'external_id']);
  const estado = pick(row, ['estado', 'Estado', 'state', 'State']);
  const resumen = pick(row, ['resumen', 'Resumen', 'summary', 'Summary', 'nombre']);
  const breveDescripcion = pick(row, [
    'breveDescripcion',
    'Breve descripción',
    'Breve descripcion',
    'short_description',
    'Short description',
  ]);
  const elementoConfiguracion = pick(row, [
    'elementoConfiguracion',
    'Elemento de configuración',
    'Elemento de configuracion',
    'cmdb_ci',
    'CI',
  ]);
  const direccionIp = pick(row, [
    'direccionIp',
    'Dirección IP',
    'Direccion IP',
    'ip',
    'ip_address',
    'IP Address',
  ]);
  const prioridad = normalizePriority(
    pick(row, ['prioridad', 'Prioridad', 'severity', 'Severity', 'priority']),
  );
  const puntuacionRiesgo =
    toNumber(
      pick(row, [
        'puntuacionRiesgo',
        'Puntuación de riesgo',
        'Puntuacion de riesgo',
        'risk_score',
        'Risk Score',
      ]),
    ) || 0;
  const grupoAsignacion = pick(row, [
    'grupoAsignacion',
    'Grupo de asignación',
    'Grupo de asignacion',
    'assignment_group',
    'Assignment group',
  ]);
  const asignadoA = pick(row, ['asignadoA', 'Asignado a', 'assigned_to', 'Assigned to']);
  const creado = pick(row, ['creado', 'Creado', 'created', 'Created', 'sys_created_on']);
  const actualizado = pick(row, ['actualizado', 'Actualizado', 'updated', 'Updated', 'sys_updated_on']);
  const fechaCreacion = pick(row, [
    'fechaCreacion',
    'Fecha creación',
    'Fecha creacion',
    'created',
    'Created',
    'sys_created_on',
    creado,
  ]);
  const dueDate = pick(row, ['dueDate', 'Due date', 'Due Date', 'deadline', 'Deadline']);
  const sites = pick(row, ['sites', 'Sites', 'Domain', 'Network']);
  const vulnerabilidad = pick(row, [
    'vulnerabilidad',
    'Vulnerabilidad',
    'Category ASVS',
    'ASVS ID',
    'OWASP TOP 10',
  ]);
  const vulnerabilitySolution = pick(row, [
    'vulnerabilitySolution',
    'Solución',
    'Solucion',
    'Vulnerability solution',
    'Solution',
    'Countermeasure',
  ]);
  const comentarios = pick(row, ['comentarios', 'Comentarios', 'Comments', 'Observations']);
  const aplazadoPor = pick(row, ['aplazadoPor', 'Aplazado por']);
  const fechaAplazamiento = pick(row, ['fechaAplazamiento', 'Fecha de aplazamiento']);
  const notasAplazamiento = pick(row, ['notasAplazamiento', 'Notas de aplazamiento']);
  const softwareVulnerable = pick(row, ['softwareVulnerable', 'Software vulnerable']);
  const resolucion = pick(row, ['resolucion', 'Resolución', 'Resolution']);

  const id =
    numero ||
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  return {
    id: String(id),
    nombre: resumen || breveDescripcion || numero,
    numero: String(numero),
    idExterno: String(idExterno),
    estado: String(estado),
    resumen: String(resumen),
    breveDescripcion: String(breveDescripcion),
    elementoConfiguracion: String(elementoConfiguracion),
    direccionIp: String(direccionIp),
    fechaCreacion: String(fechaCreacion || creado),
    prioridad,
    puntuacionRiesgo,
    grupoAsignacion: String(grupoAsignacion),
    asignadoA: String(asignadoA),
    sites: String(sites),
    vulnerabilidad: String(vulnerabilidad),
    vulnerabilitySolution: String(vulnerabilitySolution),
    aplazadoPor: String(aplazadoPor),
    fechaAplazamiento: String(fechaAplazamiento),
    notasAplazamiento: String(notasAplazamiento),
    softwareVulnerable: String(softwareVulnerable),
    resolucion: String(resolucion),
    comentarios: String(comentarios),
    creado: String(creado),
    actualizado: String(actualizado),
    dueDate: String(dueDate),
    hasLink: Boolean(row.hasLink), // ✅ ojo en VIT solo si backend indica relación
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