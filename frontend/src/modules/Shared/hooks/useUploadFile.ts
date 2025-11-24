
// src/modules/Shared/hooks/useUploadFile.ts
import { useState } from 'react';
import { mutate } from 'swr';

export interface Entry { [key: string]: unknown }
export interface DuplicatePair { existing: Entry; incoming: Entry }

type Endpoints = {
  uploadUrl: string;
  saveUrl: string;
  listUrlForMutate?: string;
};

type UploadResponse = {
  duplicates?: DuplicatePair[];
  new?: Entry[];
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

export function useUploadFile(onClose: (success: boolean) => void, endpoints: Endpoints) {
  const { uploadUrl, saveUrl, listUrlForMutate } = endpoints;

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([]);
  const [resolverOpen, setResolverOpen] = useState(false);
  const [newEntries, setNewEntries] = useState<Entry[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<('existing' | 'incoming')[]>([]);
  const [loading, setLoading] = useState(false);

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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(uploadUrl, { method: 'POST', body: formData });

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
      } else {
        const sanitizedNew = Array.isArray(result.new) ? result.new.map(sanitizeEntry) : [];
        await guardarFinal(sanitizedNew);
        setMensaje('✅ Archivo subido correctamente.');
        onClose(true);
        safeMutate();
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

  const guardarFinal = async (finalEntries: Entry[]) => {
    const sanitizedFinal = finalEntries.map(sanitizeEntry);

    const res = await fetch(saveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: sanitizedFinal }),
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = (await res.json()) as Partial<UploadResponse>;
        msg = j?.error || j?.message || msg;
      } catch { /* ignore */ }
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
      await guardarFinal(finalEntries);

      setResolverOpen(false);
      setMensaje('✅ Selección guardada correctamente.');
      onClose(true);
      safeMutate();
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
  };
}
