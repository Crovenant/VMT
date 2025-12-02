// src/modules/Shared/hooks/useUploadFile.ts
import { useState } from 'react'
import { mutate } from 'swr'
import RelationResolverModal from './../../Pages/Dashboard/Components/upload/Vit to Vul/RelationResolverModal'
import { NewFieldsModal, detectNewFields } from './../../Shared/FieldMapping'

export interface Entry { [key: string]: unknown }
export interface DuplicatePair { existing: Entry; incoming: Entry }

type RelationChange = { vulNumero: string; vitNumero: string; before: string; after: string }

type Endpoints = { uploadUrl: string; saveUrl: string; listUrlForMutate?: string }

type UploadResponse = {
  duplicates?: DuplicatePair[]
  new?: Entry[]
  relations?: RelationChange[]
  error?: string
  message?: string
  fields?: string[]
}

type FileType = 'VIT' | 'VUL' | 'UNKNOWN'

type PendingUpload = {
  file: File
  detected: FileType
  headers: string[]
  unknown: string[]
}

function sanitizeEntry(entry: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [key, value] of Object.entries(entry)) {
    out[key] = value === null || value === undefined || (typeof value === 'number' && isNaN(value)) ? '' : value
  }
  return out
}

function normHeader(s: unknown): string {
  return String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

function extractBaseUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.origin
  } catch {
    return ''
  }
}

async function extractHeaders(file: File): Promise<string[]> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv')) {
    const text = await file.text()
    const firstLine = text.split(/\r?\n/)[0] ?? ''
    return firstLine.split(',').map((h) => h.trim()).filter(Boolean)
  }
  const buffer = await file.arrayBuffer()
  const XLSX = await import('xlsx')
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown as (string | number)[][]
  const headerRow = (rows[0] ?? []).map((v) => String(v).trim())
  return headerRow.filter(Boolean)
}

const VIT_SIGNATURES = [
  'numero',
  'idexterno',
  'estado',
  'resumen',
  'brevedescripcion',
  'elementoconfiguracion',
  'prioridad',
  'puntuacionriesgo',
  'grupoasignacion',
  'asignadoa',
  'creado',
  'actualizado',
  'sites',
  'vulnerabilitysolution',
  'vulnerabilidad',
  'vul'
].map(normHeader)

const VUL_SIGNATURES = [
  'numero',
  'activo',
  'elementosvulnerables',
  'asignadoa',
  'grupoasignacion',
  'prioridad',
  'estado',
  'actualizado',
  'vits'
].map(normHeader)

function detectFileType(headers: string[]): FileType {
  if (!headers || headers.length === 0) return 'UNKNOWN'
  const H = headers.map(normHeader)
  const vitMatches = H.filter((h) => VIT_SIGNATURES.includes(h)).length
  const vulMatches = H.filter((h) => VUL_SIGNATURES.includes(h)).length
  if (vitMatches === 0 && vulMatches === 0) return 'UNKNOWN'
  if (vitMatches > vulMatches) return 'VIT'
  if (vulMatches > vitMatches) return 'VUL'
  return 'UNKNOWN'
}

function getUrlType(url: string): FileType {
  const u = url.toLowerCase()
  if (u.includes('/vit/')) return 'VIT'
  if (u.includes('/vul/')) return 'VUL'
  return 'UNKNOWN'
}

function swapUrlTo(url: string, target: FileType): string {
  if (target === 'UNKNOWN') return url
  if (target === 'VIT') return url.replace('/vul/', '/vit/')
  if (target === 'VUL') return url.replace('/vit/', '/vul/')
  return url
}

export function useUploadFile(onClose: (success: boolean) => void, endpoints: Endpoints) {
  const { uploadUrl, saveUrl, listUrlForMutate } = endpoints
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([])
  const [resolverOpen, setResolverOpen] = useState(false)
  const [newEntries, setNewEntries] = useState<Entry[]>([])
  const [selectedOptions, setSelectedOptions] = useState<('existing' | 'incoming')[]>([])
  const [loading, setLoading] = useState(false)
  const [relationModalOpen, setRelationModalOpen] = useState(false)
  const [relations, setRelations] = useState<RelationChange[]>([])
  const [relationSelections, setRelationSelections] = useState<('apply' | 'ignore')[]>([])
  const [newFieldsModalOpen, setNewFieldsModalOpen] = useState(false)
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null)

  const safeMutate = () => {
    if (listUrlForMutate) mutate(listUrlForMutate)
  }

  const processUpload = async (file: File, detected: FileType) => {
    const currentUrlType = getUrlType(uploadUrl)
    const targetUploadUrl = swapUrlTo(uploadUrl, detected)
    const targetSaveUrl = swapUrlTo(saveUrl, detected)
    if (currentUrlType !== detected) {
      setMensaje(
        detected === 'VIT'
          ? 'ℹ️ Detected VIT file. Redirecting to VIT endpoint.'
          : 'ℹ️ Detected VUL file. Redirecting to VUL endpoint.'
      )
    }
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(targetUploadUrl, { method: 'POST', body: formData })
    let result: UploadResponse = {}
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const rawText = await response.text()
      result = JSON.parse(rawText) as UploadResponse
    } else if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    if (!response.ok) {
      const msg = result?.error || result?.message || `HTTP ${response.status}`
      throw new Error(msg)
    }
    if (Array.isArray(result.duplicates) && result.duplicates.length > 0) {
      const sanitizedDuplicates = result.duplicates.map((pair) => ({
        existing: sanitizeEntry(pair.existing),
        incoming: sanitizeEntry(pair.incoming)
      }))
      setDuplicates(sanitizedDuplicates)
      setNewEntries(Array.isArray(result.new) ? result.new.map(sanitizeEntry) : [])
      setSelectedOptions(Array(result.duplicates.length).fill('incoming'))
      setResolverOpen(true)
      if (result.relations && result.relations.length > 0) {
        setRelations(result.relations)
        setRelationSelections(new Array(result.relations.length).fill('apply'))
      }
    } else {
      const sanitizedNew = Array.isArray(result.new) ? result.new.map(sanitizeEntry) : []
      if (result.relations && result.relations.length > 0) {
        setNewEntries(sanitizedNew)
        setRelations(result.relations)
        setRelationSelections(new Array(result.relations.length).fill('apply'))
        setRelationModalOpen(true)
        setMensaje('⚠️ Relations detected. Confirm before saving.')
      } else {
        await guardarFinal(targetSaveUrl, sanitizedNew)
        setMensaje('✅ File uploaded successfully.')
        onClose(true)
        safeMutate()
      }
    }
  }

  const guardarFinal = async (saveEndpoint: string, finalEntries: Entry[]) => {
    const sanitizedFinal = finalEntries.map(sanitizeEntry)
    const res = await fetch(saveEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: sanitizedFinal })
    })
    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      try {
        const j = (await res.json()) as Partial<UploadResponse>
        msg = j?.error || j?.message || msg
      } catch {}
      throw new Error(`Error saving selection: ${msg}`)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (event.target) event.target.value = ''
    if (!file) {
      setMensaje('❌ No file selected.')
      onClose(false)
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const headers = await extractHeaders(file)
      const detected = detectFileType(headers)
      if (detected === 'UNKNOWN') {
        setMensaje('❌ Unrecognized format. Please check the file.')
        onClose(false)
        return
      }
      const baseUrl = extractBaseUrl(uploadUrl)
      const unknownFields = await detectNewFields(headers, detected === 'UNKNOWN' ? 'VIT' : detected, baseUrl)
      if (unknownFields.length > 0) {
        setPendingUpload({ file, detected, headers, unknown: unknownFields })
        setNewFieldsModalOpen(true)
        setLoading(false)
        return
      }
      await processUpload(file, detected)
    } catch (error: unknown) {
      const msg =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message ?? 'unknown')
          : 'unknown'
      setMensaje(`❌ Upload error: ${msg}`)
      onClose(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDuplicates = async () => {
    if (loading) return
    setLoading(true)
    try {
      const seleccionadas = selectedOptions.map((choice, idx) =>
        choice === 'incoming' ? duplicates[idx].incoming : duplicates[idx].existing
      )
      const finalEntries = [...newEntries, ...seleccionadas]
      setResolverOpen(false)
      if (relations.length > 0) {
        setNewEntries(finalEntries)
        setRelationModalOpen(true)
        setMensaje('⚠️ Relations detected. Confirm before saving.')
      } else {
        const targetSaveUrl = swapUrlTo(saveUrl, getUrlType(uploadUrl))
        await guardarFinal(targetSaveUrl, finalEntries)
        setMensaje('✅ Selection saved successfully.')
        onClose(true)
        safeMutate()
      }
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message ?? 'Error saving selection')
          : 'Error saving selection'
      setMensaje(`❌ ${msg}`)
      onClose(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmRelations = async () => {
    if (loading) return
    setLoading(true)
    try {
      const relacionesAplicadas = relations.filter((_, idx) => relationSelections[idx] === 'apply')
      if (relacionesAplicadas.length === 0) {
        setMensaje('❌ No relations applied.')
        setRelationModalOpen(false)
        onClose(false)
        return
      }
      const detectedForApply = getUrlType(uploadUrl)
      const targetSaveUrl = swapUrlTo(saveUrl, detectedForApply)
      if (newEntries.length > 0) {
        await guardarFinal(targetSaveUrl, newEntries)
      }
      const applyUrlBase = swapUrlTo(uploadUrl, detectedForApply)
      const applyUrl = applyUrlBase.replace('/upload/', '/apply-relations/')
      const res = await fetch(applyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relations: relacionesAplicadas })
      })
      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const j = await res.json()
          msg = j?.error || msg
        } catch {}
        throw new Error(`Error applying relations: ${msg}`)
      }
      setRelationModalOpen(false)
      setMensaje('✅ Relations applied successfully.')
      onClose(true)
      safeMutate()
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message ?? 'Error applying relations')
          : 'Error applying relations'
      setMensaje(`❌ ${msg}`)
      onClose(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmNewFields = async () => {
    if (!pendingUpload || pendingUpload.detected === 'UNKNOWN') {
      setNewFieldsModalOpen(false)
      return
    }
    setLoading(true)
    try {
      const baseUrl = extractBaseUrl(uploadUrl)
      const applyUrl = `${baseUrl}/schema/apply-new-fields/`.replace(/(?<!:)\/\//g, '/')
      const res = await fetch(applyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewType: pendingUpload.detected, newFields: pendingUpload.unknown })
      })
      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const j = await res.json()
          msg = j?.error || msg
        } catch {}
        throw new Error(msg)
      }
      mutate(`/schema/${pendingUpload.detected}/`)
      setNewFieldsModalOpen(false)
      await processUpload(pendingUpload.file, pendingUpload.detected)
    } catch {
      setMensaje('❌ Error applying new fields.')
      onClose(false)
    } finally {
      setLoading(false)
      setPendingUpload(null)
    }
  }

  return {
    mensaje,
    resolverOpen,
    duplicates,
    selectedOptions,
    loading,
    setSelectedOptions,
    handleFileUpload,
    handleConfirmDuplicates,
    closeResolver: () => setResolverOpen(false),
    relationModalOpen,
    relations,
    relationSelections,
    setRelationSelections,
    handleConfirmRelations,
    closeRelationModal: () => {
      setRelationModalOpen(false)
      setRelations([])
      setRelationSelections([])
      setNewEntries([])
      setMensaje('❌ Operation cancelled. No changes were saved.')
    },
    RelationResolverModal,
    NewFieldsModal,
    newFieldsModalOpen,
    newFieldsDetected: pendingUpload?.unknown ?? [],
    handleConfirmNewFields,
    pendingHeaders: pendingUpload?.headers ?? [],
    closeNewFieldsModal: () => {
      setNewFieldsModalOpen(false)
      setPendingUpload(null)
      setMensaje('❌ Operation cancelled. No changes were saved.')
    }
  }
}
