// src/modules/Main/hooks/useItems.ts
import { useEffect, useState } from 'react';
import type { Item } from '../types/item';

function normalizePriority(p: string): Item['prioridad'] {
  const raw = (p || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (raw.startsWith('crit')) return 'Crítico';
  if (raw.startsWith('alt'))  return 'Alto';
  if (raw.startsWith('med'))  return 'Medio';
  if (raw.startsWith('baj'))  return 'Bajo';
  return 'Medio';
}

function makeIdFallback(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeItem(entry: any): Item {
  const prioridad = normalizePriority(entry.prioridad ?? entry.prioridadRiesgo ?? '');

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
    nombre: entry.nombre ?? entry.resumen ?? '',
    numero: entry.numero ?? '',
    idExterno: entry.idExterno ?? '',
    estado: entry.estado ?? '',
    resumen: entry.resumen ?? '',
    breveDescripcion: entry.breveDescripcion ?? '',
    elementoConfiguracion: entry.elementoConfiguracion ?? '',
    fechaCreacion: String(creado),
    prioridad,
    puntuacionRiesgo: Number(entry.puntuacionRiesgo ?? entry.riesgo ?? 0),
    grupoAsignacion: entry.grupoAsignacion ?? '',
    asignadoA: entry.asignadoA ?? '',
    sites: entry.sites ?? '',
    vulnerabilidad: entry.vulnerabilidad ?? '',
    vulnerabilitySolution: entry.vulnerabilitySolution ?? '',
    creado: String(creado),
    actualizado: String(actualizado),
  };
}

export default function useItems(refreshKey: number) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchData = () => {
      fetch('http://localhost:8000/risk-data/')
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((raw: any[]) => {
          const normalized = (Array.isArray(raw) ? raw : []).map(normalizeItem);

          const msPerDay = 1000 * 60 * 60 * 24;
          const horizonDaysByPriority: Record<Item['prioridad'], number> = {
            'Crítico': 30,
            'Alto': 90,
            'Medio': 365,
            'Bajo': 365,
          };

          const now = new Date();

          const withFlags = normalized.map((item) => {
            const created = new Date(item.fechaCreacion);
            if (isNaN(created.getTime())) {
              return { ...item, followUp: false, soonDue: false };
            }

            const horizonDays = horizonDaysByPriority[item.prioridad] ?? 365;
            const expiry = new Date(created.getTime() + horizonDays * msPerDay);
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
    };

    fetchData(); // primera carga o cambio de refreshKey

    const interval = setInterval(fetchData, 2000); // polling cada 2 segundos

    return () => clearInterval(interval);
  }, [refreshKey]); // ← se mantiene para el botón y el upload
  

  return { items };
}