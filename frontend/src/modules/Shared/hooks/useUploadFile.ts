
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

      // Duplicados
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
        // Sin duplicados
        const sanitizedNew = Array.isArray(result.new) ? result.new.map(sanitizeEntry) : [];

        if (result.relations && result.relations.length > 0) {
          // Si hay relaciones, NO guardar todavía (gating por modal)
          setNewEntries(sanitizedNew);
          setRelations(result.relations);
          setRelationSelections(new Array(result.relations.length).fill('apply'));
          setRelationModalOpen(true);
          setMensaje('⚠️ Se detectaron relaciones. Confirma antes de guardar.');
        } else {
          // Sin relaciones: guardado directo
          await guardarFinal(sanitizedNew);
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

      setResolverOpen(false);

      if (relations.length > 0) {
        // Gating: NO guardar hasta confirmar relaciones
        setNewEntries(finalEntries);
        setRelationModalOpen(true);
        setMensaje('⚠️ Se detectaron relaciones. Confirma antes de guardar.');
      } else {
        // No hay relaciones: podemos guardar
        await guardarFinal(finalEntries);
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
      // Filtrar solo las relaciones marcadas como "apply"
      const relacionesAplicadas = relations.filter((_, idx) => relationSelections[idx] === 'apply');

      if (relacionesAplicadas.length === 0) {
        setMensaje('❌ No se aplicó ninguna relación.');
        setRelationModalOpen(false);
        onClose(false);
        return;
      }

      // Guardar las entradas (VIT o VUL) solo al confirmar el modal de relaciones
      if (newEntries.length > 0) {
        await guardarFinal(newEntries);
      }

      // Aplicar relaciones (detectamos si es VIT o VUL por la URL base)
      const applyUrl = uploadUrl.replace('/upload/', '/apply-relations/');

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
        } catch { /* ignore */ }
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
      // Cancelar: NO se guarda nada y se limpia el estado para evitar persistencias accidentales
      setRelationModalOpen(false);
      setRelations([]);
      setRelationSelections([]);
      setNewEntries([]);
      setMensaje('❌ Operación cancelada. No se guardó ningún cambio.');
    },
    RelationResolverModal,
  };
}
