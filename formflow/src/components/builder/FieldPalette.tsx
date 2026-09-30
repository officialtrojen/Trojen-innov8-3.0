'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Type,
  AlignLeft,
  ListChecks,
  Star,
  Upload,
  Calendar,
  Sparkles,
  CheckSquare,
} from 'lucide-react';
import { FIELD_PALETTE } from '@/lib/types';

const iconMap: Record<string, React.ElementType> = {
  Type,
  AlignLeft,
  ListChecks,
  Star,
  Upload,
  Calendar,
  Sparkles,
  CheckSquare,
};

function PaletteItem({ type, label, icon, onAdd }: { type: string; label: string; icon: string; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
  });

  const Icon = iconMap[icon] || Type;

  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    cursor: 'grab',
    background: isDragging ? '#CFE5E3' : 'transparent',
    border: '1.5px solid transparent',
    transition: 'all 0.15s ease',
    fontSize: 13,
    color: '#263B3B',
    fontWeight: 600,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onAdd}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#EAF4F4';
        (e.currentTarget as HTMLElement).style.borderColor = '#B8CECF';
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
        }
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: '#CFE5E3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4F7C7A',
          flexShrink: 0,
        }}
      >
        <Icon size={15} />
      </div>
      <span>{label}</span>
    </div>
  );
}

interface FieldPaletteProps {
  onAddField: (type: string) => void;
}

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <div style={{ color: '#263B3B' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#4F7C7A',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          marginBottom: 12,
          padding: '0 4px',
          borderBottom: '1px solid #B8CECF',
          paddingBottom: 8,
        }}
      >
        Question Blocks
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {FIELD_PALETTE.map((item) => (
          <PaletteItem
            key={item.type}
            type={item.type}
            label={item.label}
            icon={item.icon}
            onAdd={() => onAddField(item.type)}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: '12px 14px',
          borderRadius: 10,
          background: '#EAF4F4',
          border: '1px solid #B8CECF',
          fontSize: 12,
          color: '#365F5D',
          lineHeight: 1.5,
        }}
      >
        💡 <strong style={{ color: '#263B3B' }}>Tip:</strong> Click or drag any block onto the canvas to add it.
      </div>
    </div>
  );
}
