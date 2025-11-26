
// src/modules/Shared/hooks/useUploadFile.ts
import { useState } from 'react';
import { mutate } from 'swr';
import RelationResolverModal from './../../Pages/Dashboard/Components/upload/Vit to Vul/RelationResolverModal';

export interface Entry { [key: string]: unknown }
export interface DuplicatePair { existing: Entry; incoming: Entry }

type RelationChange = {
  vulNumero: string;
  vitNumero: string;
  before: string;
  after: string;
};

type Endpoints = {
  uploadUrl: string;
  saveUrl: string;
  listUrlForMutate?: string;
};

type UploadResponse = {
  duplicates?: DuplicatePair[];
  new?: Entry[];
  relations?: RelationChange[];
  error?: string;
  message?: string;
};

function sanitizeEntry(entry: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(entry)) {
    if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
      sanitized[key] = '';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

type FileType = 'VIT' | 'VUL' | 'UNKNOWN';

function normHeader(s: unknown): string {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

async function extractHeaders(file: File): Promise<string[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) {
    const text = await file.text();
    const firstLine = text.split(/\r?\n/)[0] ?? '';
    return firstLine.split(',').map(h => h.trim()).filter(Boolean);
  }
  const buffer = await file.arrayBuffer();
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown as (string | number)[][];
  const headerRow = (rows[0] ?? []).map(v => String(v).trim());
  return headerRow.filter(Boolean);
}

const VIT_SIGNATURES = [
  'Número', 'ID externo', 'Estado', 'Resumen', 'Asignado a', 'Creado', 'Actualizado',
  'numero', 'idExterno', 'estado', 'resumen', 'asignadoA', 'creado', 'actualizado'
].map(normHeader);

const VUL_SIGNATURES = [
  'Número', 'Estado', 'Prioridad', 'VITS', 'Actualizado', 'id',
  'numero', 'estado', 'prioridad', 'vits'
].map(normHeader);

function detectFileType(headers: string[]): FileType {
  if (!headers || headers.length === 0) return 'UNKNOWN';
  const H = headers.map(normHeader);
  const vitMatches = H.filter(h => VIT_SIGNATURES.includes(h)).length;
  const vulMatches = H.filter(h => VUL_SIGNATURES.includes(h)).length;
  if (vitMatches === 0 && vulMatches === 0) return 'UNKNOWN';
  if (vitMatches > vulMatches) return 'VIT';
  if (vulMatches > vitMatches) return 'VUL';
  return 'UNKNOWN';
}

function getUrlType(url: string): FileType {
  const u = url.toLowerCase();
  if (u.includes('/vit/')) return 'VIT';
  if (u.includes('/vul/')) return 'VUL';
  return 'UNKNOWN';
}

function swapUrlTo(url: string, target: FileType): string {
  if (target === 'UNKNOWN') return url;
  if (target === 'VIT') return url.replace('/vul/', '/vit/');
  if (target === 'VUL') return url.replace('/vit/', '/vul/');
  return url;
}

export function useUploadFile(onClose: (success: boolean) => void, endpoints: Endpoints) {
  const { uploadUrl, saveUrl, listUrlForMutate } = endpoints;

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([]);
  const [resolverOpen, setResolverOpen] = useState(false);
  const [newEntries, setNewEntries] = useState<Entry[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<('existing' | 'incoming')[]>([]);
  const [loading, setLoading] = useState(false);

  const [relationModalOpen, setRelationModalOpen] = useState(false);
  const [relations, setRelations] = useState<RelationChange[]>([]);
  const [relationSelections, setRelationSelections] = useState<('apply' | 'ignore')[]>([]);

  const safeMutate = () => { if (listUrlForMutate) mutate(listUrlForMutate); };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (event.target) event.target.value = '';

    if (!file) {
      setMensaje('❌ No se seleccionó ningún archivo.');
      onClose(false);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const headers = await extractHeaders(file);
      const detected = detectFileType(headers);

      if (detected === 'UNKNOWN') {
        setMensaje('❌ Formato no reconocido. Verifica el archivo.');
        onClose(false);
        return;
      }

      const currentUrlType = getUrlType(uploadUrl);
      const targetUploadUrl = swapUrlTo(uploadUrl, detected);
      const targetSaveUrl = swapUrlTo(saveUrl, detected);

      if (currentUrlType !== detected) {
        setMensaje(
          detected === 'VIT'
            ? 'ℹ️ Archivo detectado como VIT. Redireccionando subida al endpoint VIT.'
            : 'ℹ️ Archivo detectado como VUL. Redireccionando subida al endpoint VUL.'
        );
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(targetUploadUrl, { method: 'POST', body: formData });

      let result: UploadResponse = {};
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const rawText = await response.text();
        result = JSON.parse(rawText) as UploadResponse;
      } else if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.ok) {
        const msg = result?.error || result?.message || `Error HTTP ${response.status}`;
        throw new Error(msg);
      }

      if (Array.isArray(result.duplicates) && result.duplicates.length > 0) {
        const sanitizedDuplicates = result.duplicates.map(pair => ({
          existing: sanitizeEntry(pair.existing),
          incoming: sanitizeEntry(pair.incoming),
        }));

        setDuplicates(sanitizedDuplicates);
        setNewEntries(Array.isArray(result.new) ? result.new.map(sanitizeEntry) : []);
        setSelectedOptions(Array(result.duplicates.length).fill('incoming'));
        setResolverOpen(true);
        setMensaje('⚠️ Se detectaron duplicados. Elige qué líneas guardar.');

        if (result.relations && result.relations.length > 0) {
          setRelations(result.relations);
          setRelationSelections(new Array(result.relations.length).fill('apply'));
        }
      } else {
        const sanitizedNew = Array.isArray(result.new) ? result.new.map(sanitizeEntry) : [];

        if (result.relations && result.relations.length > 0) {
          setNewEntries(sanitizedNew);
          setRelations(result.relations);
          setRelationSelections(new Array(result.relations.length).fill('apply'));
          setRelationModalOpen(true);
          setMensaje('⚠️ Se detectaron relaciones. Confirma antes de guardar.');
        } else {
          await guardarFinal(targetSaveUrl, sanitizedNew);
          setMensaje('✅ Archivo subido correctamente.');
          onClose(true);
          safeMutate();
        }
      }
    } catch (error: unknown) {
      const msg =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message ?? 'desconocido')
          : 'desconocido';
      setMensaje(`❌ Error al subir el archivo: ${msg}`);
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  const guardarFinal = async (saveEndpoint: string, finalEntries: Entry[]) => {
    const sanitizedFinal = finalEntries.map(sanitizeEntry);

    const res = await fetch(saveEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: sanitizedFinal }),
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = (await res.json()) as Partial<UploadResponse>;
        msg = j?.error || j?.message || msg;
      } catch {}
      throw new Error(`Error al guardar selección: ${msg}`);
    }
  };

  const handleConfirmDuplicates = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const seleccionadas = selectedOptions.map((choice, idx) =>
        choice === 'incoming' ? duplicates[idx].incoming : duplicates[idx].existing
      );
      const finalEntries = [...newEntries, ...seleccionadas];

      setResolverOpen(false);

      if (relations.length > 0) {
        setNewEntries(finalEntries);
        setRelationModalOpen(true);
        setMensaje('⚠️ Se detectaron relaciones. Confirma antes de guardar.');
      } else {
        const targetSaveUrl = swapUrlTo(saveUrl, getUrlType(uploadUrl));
        await guardarFinal(targetSaveUrl, finalEntries);
        setMensaje('✅ Selección guardada correctamente.');
        onClose(true);
        safeMutate();
      }
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message ?? 'Error al guardar selección')
          : 'Error al guardar selección';
      setMensaje(`❌ ${msg}`);
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRelations = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const relacionesAplicadas = relations.filter((_, idx) => relationSelections[idx] === 'apply');

      if (relacionesAplicadas.length === 0) {
        setMensaje('❌ No se aplicó ninguna relación.');
        setRelationModalOpen(false);
        onClose(false);
        return;
      }

      const detectedForApply = getUrlType(uploadUrl);
      const targetSaveUrl = swapUrlTo(saveUrl, detectedForApply);

      if (newEntries.length > 0) {
        await guardarFinal(targetSaveUrl, newEntries);
      }

      const applyUrlBase = swapUrlTo(uploadUrl, detectedForApply);
      const applyUrl = applyUrlBase.replace('/upload/', '/apply-relations/');

      const res = await fetch(applyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relations: relacionesAplicadas }),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          msg = j?.error || msg;
        } catch {}
        throw new Error(`Error al aplicar relaciones: ${msg}`);
      }

      setRelationModalOpen(false);
      setMensaje('✅ Relaciones aplicadas correctamente.');
      onClose(true);
      safeMutate();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message ?? 'Error al aplicar relaciones')
          : 'Error al aplicar relaciones';
      setMensaje(`❌ ${msg}`);
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

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
      setRelationModalOpen(false);
      setRelations([]);
      setRelationSelections([]);
      setNewEntries([]);
      setMensaje('❌ Operación cancelada. No se guardó ningún cambio.');
    },
    RelationResolverModal,
  };
}
