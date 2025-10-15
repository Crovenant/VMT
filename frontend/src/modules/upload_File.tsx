import React, { useRef, useState } from 'react';
import { mutate } from 'swr';
import DuplicateResolver from './DuplicateResolver';

interface UploadFileProps {
  onClose: (success: boolean) => void;
}

interface Entry {
  [key: string]: any;
}

interface DuplicatePair {
  existing: Entry;
  incoming: Entry;
}

const UploadFile: React.FC<UploadFileProps> = ({ onClose }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      const response = await fetch('http://localhost:8000/upload_data/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.duplicates && result.duplicates.length > 0) {
        setDuplicates(result.duplicates);
        setNewEntries(result.new || []);
        setSelectedOptions(Array(result.duplicates.length).fill('incoming'));
        setResolverOpen(true);
        setMensaje('⚠️ Se detectaron duplicados. Elige qué líneas guardar.');
      } else {
        console.log("🧾 Array sin duplicados que se va a postear:", result.new || []);
        await guardarFinal(result.new || []);
        setMensaje('✅ Archivo subido correctamente sin duplicados.');
        onClose(true);
        mutate('http://localhost:8000/risk-data/');
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setMensaje('❌ Error al subir el archivo');
      onClose(false);
    }
  };

  const guardarFinal = async (finalEntries: Entry[]) => {
    try {
      await fetch('http://localhost:8000/save_selection/', {
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
    console.log("🧾 Array con selección de duplicados que se va a postear:", finalEntries);
    await guardarFinal(finalEntries);

    setResolverOpen(false);
    setMensaje('✅ Selección guardada correctamente.');
    onClose(true);
    mutate('http://localhost:8000/risk-data/');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Selecciona un archivo Excel</h3>
      <input
        type="file"
        ref={fileInputRef}
        accept=".xls,.xlsx,.csv"
        onChange={handleFileUpload}
      />
      <br />
      <button onClick={() => onClose(false)} style={{ marginTop: '1rem' }}>
        Cancelar
      </button>
      {mensaje && (
        <div style={{ marginTop: '1rem', color: mensaje.startsWith('✅') ? 'green' : 'red' }}>
          {mensaje}
        </div>
      )}

      <DuplicateResolver
        open={resolverOpen}
        duplicates={duplicates}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        onClose={() => setResolverOpen(false)}
        onConfirm={handleConfirmDuplicates}
      />
    </div>
  );
};

export default UploadFile;