// src/modules/Main/Components/UploadFile/UploadFileWrapper.tsx
import DuplicateResolver from '../DuplicateResolver/ResolverWrapper';
import { useUploadFile } from '../../hooks/useUploadFile';
import { useRef } from 'react';

interface UploadFileProps {
  onClose: (success: boolean) => void;
}

export default function UploadFileWrapper({ onClose }: UploadFileProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    mensaje,
    resolverOpen,
    duplicates,
    selectedOptions,
    setSelectedOptions,
    handleFileUpload,
    handleConfirmDuplicates,
  } = useUploadFile(onClose);

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
        <div
          style={{
            marginTop: '1rem',
            color: mensaje.startsWith('✅') ? 'green' : 'red',
          }}
        >
          {mensaje}
        </div>
      )}

      <DuplicateResolver
        open={resolverOpen}
        duplicates={duplicates}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        onClose={() => setSelectedOptions([])}
        onConfirm={handleConfirmDuplicates}
      />
    </div>
  );
}