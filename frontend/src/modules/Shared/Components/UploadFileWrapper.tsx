
import { useRef, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DuplicateResolver from '../../Pages/Dashboard/Components/DuplicateResolver/ResolverWrapper';
import RelationResolverModal from '../../Pages/Dashboard/Components/upload/Vit to Vul/RelationResolverModal';
import { useUploadFile } from '../hooks/useUploadFile';
import type { DuplicatePair } from '../../Types/uploadTypes';

interface UploadFileProps {
  onClose: (success: boolean) => void;
  uploadUrl: string;
  saveUrl: string;
  listUrlForMutate?: string;
}

export default function UploadFileWrapper({
  onClose,
  uploadUrl,
  saveUrl,
  listUrlForMutate,
}: UploadFileProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    mensaje,
    resolverOpen,
    duplicates,
    selectedOptions,
    setSelectedOptions,
    handleFileUpload,
    handleConfirmDuplicates,
    closeResolver,
    relationModalOpen,
    relations,
    relationSelections,
    setRelationSelections,
    handleConfirmRelations,
    closeRelationModal,
  } = useUploadFile(onClose, { uploadUrl, saveUrl, listUrlForMutate });

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
      handleFileUpload({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3>Select Excel File</h3>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: '2px dashed #1976d2',
          borderRadius: '8px',
          padding: '40px 20px',
          marginBottom: '1rem',
          backgroundColor: dragOver ? '#e3f2fd' : '#fafafa',
          color: '#1976d2',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2', marginBottom: '10px' }} />
        <span style={{ fontSize: '16px', fontWeight: 500 }}>
          {dragOver ? 'Suelta el archivo aquí' : 'Drag & Drop, or brwose.'}
        </span>
      </div>


      <input
        type="file"
        ref={fileInputRef}
        accept=".xls,.xlsx,.csv"
        onChange={handleFileUpload}
        style={{ marginBottom: '1rem' }}
      />
      <br />

      <button
        onClick={() => {
          if (fileInputRef.current) fileInputRef.current.value = '';
          onClose(false);
        }}
        style={{ marginTop: '1rem' }}
      >
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
        duplicates={duplicates as DuplicatePair[]}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        onClose={() => {
          closeResolver();
          setSelectedOptions([]);
        }}
        onConfirm={handleConfirmDuplicates}
      />

      <RelationResolverModal
        open={relationModalOpen}
        relations={relations}
        selectedOptions={relationSelections}
        setSelectedOptions={setRelationSelections}
        onConfirm={handleConfirmRelations}
        onCancel={closeRelationModal}
      />
    </div>
  );
}
