// src/modules/Pages/Dashboard/Components/DisplayData/DisplayTable/hooks/useColumnMap.ts
import { useMemo } from 'react'
import { MINIMAL_SCHEMA_CATALOG, useFieldSchema } from '../../../../../../Shared/FieldMapping'

const KEY_LABEL_OVERRIDES: Record<'VIT' | 'VUL', Record<string, string>> = {
  VIT: {
    numero: 'Número',
    idExterno: 'ID externo',
    estado: 'Estado',
    resumen: 'Resumen',
    breveDescripcion: 'Breve descripción',
    elementoConfiguracion: 'Elemento de configuración',
    prioridad: 'Prioridad',
    puntuacionRiesgo: 'Puntuación de riesgo',
    grupoAsignacion: 'Grupo de asignación',
    asignadoA: 'Asignado a',
    creado: 'Creado',
    actualizado: 'Actualizado',
    sites: 'Sites',
    vulnerabilitySolution: 'Solución',
    vulnerabilidad: 'Vulnerabilidad',
    dueDate: 'Due date',
    vul: 'VUL'
  },
  VUL: {
    numero: 'Número',
    activo: 'Activo',
    elementosVulnerables: 'Elementos vulnerables',
    asignadoA: 'Asignado a',
    grupoAsignacion: 'Grupo de asignación',
    prioridad: 'Prioridad',
    estado: 'Estado',
    actualizado: 'Actualizado',
    vits: 'VITS'
  }
}

const EXTRA_KEYS: Record<'VIT' | 'VUL', string[]> = {
  VIT: ['dueDate'],
  VUL: []
}

type ViewType = 'VIT' | 'VUL'

type ColumnMapResult = { map: Record<string, string>; allColumns: string[] }

export function useColumnMap(viewType: ViewType): ColumnMapResult {
  const { fields } = useFieldSchema(viewType)
  return useMemo(() => {
    const fallbackKeys = MINIMAL_SCHEMA_CATALOG[viewType].keys
    const baseKeys = Array.isArray(fields) && fields.length ? fields : fallbackKeys
    const mergedKeys = Array.from(new Set([...baseKeys, ...EXTRA_KEYS[viewType]]))
    const map: Record<string, string> = {}
    const allColumns: string[] = []
    mergedKeys.forEach((key) => {
      const label = KEY_LABEL_OVERRIDES[viewType][key] || key
      if (!map[label]) {
        map[label] = key
        allColumns.push(label)
      }
    })
    return { map, allColumns }
  }, [fields, viewType])
}
