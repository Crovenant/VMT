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

    // Campo que usa el front para cálculos
    fechaCreacion: String(creado),

    // Prioridad normalizada para el chart
    prioridad,

    puntuacionRiesgo: Number(entry.puntuacionRiesgo ?? entry.riesgo ?? 0),
    grupoAsignacion: entry.grupoAsignacion ?? '',
    asignadoA: entry.asignadoA ?? '',
    sites: entry.sites ?? '',
    vulnerabilidad: entry.vulnerabilidad ?? '',
    vulnerabilitySolution: entry.vulnerabilitySolution ?? '',

    // Requeridos por tu tipo Item
    creado: String(creado),
    actualizado: String(actualizado),

    // Se calcularán luego
    // followUp: false,
    // soonDue: false,
  };
}

export default function useItems(refreshKey: number) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/risk-data/')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((raw: any[]) => {
        const normalized = (Array.isArray(raw) ? raw : []).map(normalizeItem);

        // Reglas de caducidad:
        // Crítico: 30 días, Alto: 90, Medio/Bajo: 365
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

          const followUp = daysToExpiry < 0;                 // ya caducó
          const soonDue  = !followUp && daysToExpiry <= 7;   // ≤ 7 días y aún no caducó

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