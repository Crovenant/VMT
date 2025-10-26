// src/modules/Components/DuplicateResolver/ResolverWrapper.tsx

import React from 'react';
import ResolverDialog from './ResolverDialog';

interface Entry {
  [key: string]: any;
}

interface DuplicatePair {
  existing: Entry;
  incoming: Entry;
}

interface Props {
  open: boolean;
  duplicates: DuplicatePair[];
  selectedOptions: ('existing' | 'incoming')[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<('existing' | 'incoming')[]>>;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResolverWrapper({
  open,
  duplicates,
  selectedOptions,
  setSelectedOptions,
  onClose,
  onConfirm
}: Props) {
  const handleChange = (index: number, value: 'existing' | 'incoming') => {
    const updated = [...selectedOptions];
    updated[index] = value;
    setSelectedOptions(updated);
    console.log(`🔘 Selección actualizada en índice ${index}:`, value);
  };

  return (
    <ResolverDialog
      open={open}
      duplicates={duplicates}
      selectedOptions={selectedOptions}
      handleChange={handleChange}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}