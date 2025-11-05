import { useEffect, useState } from 'react';
import type { Item } from '../../Types/item';

function normalizePriority(p: string): Item['prioridad'] {
  const raw = (p || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (raw.startsWith('crit')) return 'Crítico';
  if (raw.startsWith('alt')) return 'Alto';
  if (raw.startsWith('med')) return 'Medio';
  if (raw.startsWith('baj')) return 'Bajo';
  return 'Medio';
}

function makeIdFallback(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeItem(entry: Record<string, unknown>): Item {
  const prioridad = normalizePriority(String(entry.prioridad ?? entry.prioridadRiesgo ?? ''));

  const creado =
    entry.creado ??
    entry.fechaCreacion ??
    entry.created ??
    entry.fecha ??
    '';

  const actualizado =
    entry.actualizado ??
    entry.fechaActualizacion ??
    entry.updated ??
    '';

  const id =
    String(
      entry.id ??
      entry.numero ??
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : makeIdFallback())
    );

  return {
    id,
    nombre: String(entry.nombre ?? entry.resumen ?? ''),
    numero: String(entry.numero ?? ''),
    idExterno: String(entry.idExterno ?? ''),
    estado: String(entry.estado ?? ''),
    resumen: String(entry.resumen ?? ''),
    breveDescripcion: String(entry.breveDescripcion ?? ''),
    elementoConfiguracion: String(entry.elementoConfiguracion ?? ''),
    fechaCreacion: String(creado),
    prioridad,
    puntuacionRiesgo: Number(entry.puntuacionRiesgo ?? entry.riesgo ?? 0),
    grupoAsignacion: String(entry.grupoAsignacion ?? ''),
    asignadoA: String(entry.asignadoA ?? ''),
    sites: String(entry.sites ?? ''),
    vulnerabilidad: String(entry.vulnerabilidad ?? ''),
    vulnerabilitySolution: String(entry.vulnerabilitySolution ?? ''),
    creado: String(creado),
    actualizado: String(actualizado),
    dueDate: String(entry.dueDate ?? ''), // ✅ Nuevo campo
  };
}

export default function useItems(refreshKey: number) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch('/risk-data/')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((raw: unknown[]) => {
        const normalized = (Array.isArray(raw) ? raw : []).map((entry) =>
          normalizeItem(entry as Record<string, unknown>)
        );

        const msPerDay = 1000 * 60 * 60 * 24;
        const horizonDaysByPriority: Record<Item['prioridad'], number> = {
          'Crítico': 30,
          'Alto': 90,
          'Medio': 365,
          'Bajo': 365,
        };

        const now = new Date();

        const withFlags = normalized.map((item) => {
          let expiry: Date;

          if (item.dueDate) {
            expiry = new Date(item.dueDate);
          } else {
            const created = new Date(item.fechaCreacion);
            const horizonDays = horizonDaysByPriority[item.prioridad] ?? 365;
            expiry = new Date(created.getTime() + horizonDays * msPerDay);
          }

          if (isNaN(expiry.getTime())) {
            return { ...item, followUp: false, soonDue: false };
          }

          const daysToExpiry = Math.floor((expiry.getTime() - now.getTime()) / msPerDay);
          const followUp = daysToExpiry < 0;
          const soonDue = !followUp && daysToExpiry <= 7;

          return { ...item, followUp, soonDue };
        });

        setItems(withFlags);
      })
      .catch((err) => {
        console.error('Error fetching items:', err);
        setItems([]);
      });
  }, [refreshKey]);

  return { items };
}