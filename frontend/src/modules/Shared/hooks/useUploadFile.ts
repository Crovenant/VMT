// src/modules/hooks/useUploadFile.ts
import { useState } from 'react';
import { mutate } from 'swr';

export interface Entry { [key: string]: unknown; }
export interface DuplicatePair { existing: Entry; incoming: Entry; }

type Endpoints = {
  uploadUrl: string;         // endpoint POST para subir Excel
  saveUrl: string;           // endpoint POST para guardar selección
  listUrlForMutate?: string; // opcional: invalidar cache SWR
};

export function useUploadFile(onClose: (success: boolean) => void, endpoints: Endpoints) {
  const { uploadUrl, saveUrl, listUrlForMutate } = endpoints;

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([]);
  const [resolverOpen, setResolverOpen] = useState(false);
  const [newEntries, setNewEntries] = useState<Entry[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<('existing' | 'incoming')[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setMensaje('❌ No se seleccionó ningún archivo.');
      onClose(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(uploadUrl, { method: 'POST', body: formData });
      const result = await response.json();

      if (result.duplicates && result.duplicates.length > 0) {
        setDuplicates(result.duplicates);
        setNewEntries(result.new || []);
        setSelectedOptions(Array(result.duplicates.length).fill('incoming'));
        setResolverOpen(true);
        setMensaje('⚠️ Se detectaron duplicados. Elige qué líneas guardar.');
      } else {
        await guardarFinal(result.new || []);
        setMensaje('✅ Archivo subido correctamente sin duplicados.');
        onClose(true);
        if (listUrlForMutate) mutate(listUrlForMutate);
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setMensaje('❌ Error al subir el archivo');
      onClose(false);
    }
  };

  const guardarFinal = async (finalEntries: Entry[]) => {
    try {
      await fetch(saveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: finalEntries }),
      });
    } catch (error) {
      console.error('Error al guardar selección:', error);
    }
  };

  const handleConfirmDuplicates = async () => {
    const seleccionadas = selectedOptions.map((choice, idx) =>
      choice === 'incoming' ? duplicates[idx].incoming : duplicates[idx].existing
    );

    const finalEntries = [...newEntries, ...seleccionadas];
    await guardarFinal(finalEntries);

    setResolverOpen(false);
    setMensaje('✅ Selección guardada correctamente.');
    onClose(true);
    if (listUrlForMutate) mutate(listUrlForMutate);
  };

  return {
    mensaje,
    resolverOpen,
    duplicates,
    selectedOptions,
    setSelectedOptions,
    handleFileUpload,
    handleConfirmDuplicates,
    closeResolver: () => setResolverOpen(false),
  };
}
