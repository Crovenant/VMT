// src/modules/Shared/FieldMapping/schemaUtils.ts
export type ViewType = 'VIT' | 'VUL'

type Catalog = { keys: string[]; labels: string[] }

const MINIMAL_FIELD_CATALOG: Record<ViewType, Catalog> = {
  VIT: {
    keys: [
      'numero',
      'idExterno',
      'estado',
      'resumen',
      'breveDescripcion',
      'elementoConfiguracion',
      'prioridad',
      'puntuacionRiesgo',
      'grupoAsignacion',
      'asignadoA',
      'creado',
      'actualizado',
      'sites',
      'vulnerabilitySolution',
      'vulnerabilidad',
      'vul'
    ],
    labels: [
      'Número',
      'ID externo',
      'Estado',
      'Resumen',
      'Breve descripción',
      'Elemento de configuración',
      'Prioridad',
      'Puntuación de riesgo',
      'Grupo de asignación',
      'Asignado a',
      'Creado',
      'Actualizado',
      'Sites',
      'Solución',
      'Vulnerabilidad',
      'VUL'
    ]
  },
  VUL: {
    keys: [
      'numero',
      'activo',
      'elementosVulnerables',
      'asignadoA',
      'grupoAsignacion',
      'prioridad',
      'estado',
      'actualizado',
      'vits'
    ],
    labels: [
      'Número',
      'Activo',
      'Elementos vulnerables',
      'Asignado a',
      'Grupo de asignación',
      'Prioridad',
      'Estado',
      'Actualizado',
      'VITS'
    ]
  }
}

export function normalizeHeader(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

function canonicalize(label: string): string {
  const cleaned = normalizeHeader(label).replace(/[^0-9a-z ]+/g, ' ')
  const tokens = cleaned.split(/\s+/).filter(Boolean)
  if (!tokens.length) return ''
  const [first, ...rest] = tokens
  return first + rest.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join('')
}

function fallbackCanonicalKeys(viewType: ViewType): string[] {
  const catalog = MINIMAL_FIELD_CATALOG[viewType]
  const labelKeys = catalog.labels.map(canonicalize)
  const merged = [...catalog.keys, ...labelKeys].filter(Boolean)
  return Array.from(new Set(merged))
}

export function canonicalCandidates(header: string): string[] {
  const set = new Set<string>()
  const main = canonicalize(header)
  const compact = normalizeHeader(header).replace(/[^0-9a-z]+/g, '')
  if (main) set.add(main)
  if (compact) set.add(compact)
  return Array.from(set)
}

export async function getCanonicalSchema(viewType: ViewType, baseUrl = ''): Promise<string[]> {
  const vt = viewType.toUpperCase() as ViewType
  const primaryUrl = `${baseUrl}/schema/${vt}/`.replace(/(?<!:)\/\//g, '/')
  try {
    const res = await fetch(primaryUrl)
    if (res.ok) {
      const data = (await res.json()) as { fields?: unknown }
      const fields = Array.isArray(data.fields) ? (data.fields as string[]) : []
      if (fields.length) return fields
    }
  } catch {}
  const fallbackUrl = `${baseUrl}/common/get-schema/?viewType=${vt}`.replace(/(?<!:)\/\//g, '/')
  try {
    const res = await fetch(fallbackUrl)
    if (res.ok) {
      const data = (await res.json()) as { schema?: unknown }
      const fields = Array.isArray((data as any).fields)
        ? ((data as any).fields as string[])
        : Array.isArray(data.schema)
          ? (data.schema as string[])
          : []
      if (fields.length) return fields
    }
  } catch {}
  return fallbackCanonicalKeys(vt)
}

export async function detectNewFields(headers: string[], viewType: ViewType, baseUrl = ''): Promise<string[]> {
  const schema = await getCanonicalSchema(viewType, baseUrl)
  const canonicalSchema = new Set(schema.map(canonicalize))
  const unknown: string[] = []
  headers.forEach((header) => {
    const candidates = canonicalCandidates(header)
    const matches = candidates.some((c) => canonicalSchema.has(c))
    if (!matches && !unknown.includes(header)) {
      unknown.push(header)
    }
  })
  return unknown
}

export const MINIMAL_SCHEMA_CATALOG = MINIMAL_FIELD_CATALOG
