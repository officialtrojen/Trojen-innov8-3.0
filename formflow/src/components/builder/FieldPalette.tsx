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
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'grab',
    background: isDragging ? 'var(--accent)' : 'transparent',
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
    fontSize: 13,
    color: '#263B3B',
    fontWeight: 500,
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
        (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(184,206,207,0.5)';
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
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
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
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#52796F',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 12,
          padding: '0 4px',
        }}
      >
        Field Types
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          marginTop: 24,
          padding: 12,
          borderRadius: 8,
          background: 'rgba(207,229,227,0.3)',
          fontSize: 12,
          color: '#52796F',
          lineHeight: 1.5,
        }}
      >
        💡 <strong>Tip:</strong> Click or drag fields onto the canvas to add them.
      </div>
    </div>
  );
}
