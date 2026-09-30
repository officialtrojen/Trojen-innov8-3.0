'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface FormDeleteTrashBinProps {
  isArmed?: boolean;
  isOver?: boolean;
}

export default function FormDeleteTrashBin({ isArmed = false, isOver = false }: FormDeleteTrashBinProps) {
  if (!isArmed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: isOver ? '#DC2626' : '#EF4444',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isOver ? '0 0 24px rgba(220, 38, 38, 0.8)' : '0 10px 25px rgba(239, 68, 68, 0.5)',
        transform: isOver ? 'scale(1.2)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 9999,
        cursor: 'pointer',
      }}
      title="Drag here to delete form"
    >
      <Trash2 size={28} />
    </div>
  );
}
