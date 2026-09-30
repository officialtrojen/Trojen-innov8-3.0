'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField } from '@/lib/types';
import { GripVertical, Trash2, Copy, Star } from 'lucide-react';

// ---------- Sortable Field Card ----------
function SortableFieldCard({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    marginBottom: 10,
  };

  const fieldTypeLabel: Record<string, string> = {
    short_text: 'Short Text',
    paragraph: 'Paragraph',
    multiple_choice: 'Multiple Choice',
    rating: 'Rating',
    file_upload: 'File Upload',
    date_picker: 'Date Picker',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className="card"
      {...attributes}
    >
      <div
        style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
          borderRadius: 'var(--radius)',
          background: isSelected ? 'rgba(207,229,227,0.15)' : 'var(--card-bg)',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Drag handle */}
        <div
          {...listeners}
          style={{
            cursor: 'grab',
            color: '#B8CECF',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 0',
          }}
        >
          <GripVertical size={16} />
        </div>

        {/* Field content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 500, fontSize: 14, color: '#263B3B' }}>
              {field.label}
            </span>
            {field.required && (
              <span style={{ color: '#e74c3c', fontSize: 12 }}>*</span>
            )}
          </div>

          {/* Field type and preview */}
          <div style={{ fontSize: 12, color: '#52796F' }}>
            {fieldTypeLabel[field.type] || field.type}
          </div>

          {/* Mini preview */}
          <div style={{ marginTop: 8 }}>
            {field.type === 'short_text' && (
              <div style={{ padding: '6px 10px', border: '1px solid var(--input-border)', borderRadius: 6, fontSize: 12, color: '#B8CECF', background: 'white' }}>
                {field.placeholder || 'Type your answer...'}
              </div>
            )}
            {field.type === 'paragraph' && (
              <div style={{ padding: '6px 10px', border: '1px solid var(--input-border)', borderRadius: 6, fontSize: 12, color: '#B8CECF', background: 'white', minHeight: 40 }}>
                {field.placeholder || 'Type detailed answer...'}
              </div>
            )}
            {field.type === 'multiple_choice' && field.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {field.options.slice(0, 3).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#263B3B' }}>
                    <div style={{ width: 14, height: 14, borderRadius: field.selectionMode === 'multiple' ? 3 : 7, border: '1.5px solid var(--input-border)' }} />
                    {opt}
                  </div>
                ))}
                {field.options.length > 3 && (
                  <span style={{ fontSize: 11, color: '#B8CECF' }}>+{field.options.length - 3} more</span>
                )}
              </div>
            )}
            {field.type === 'rating' && (
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: field.maxStars || 5 }).map((_, i) => (
                  <Star key={i} size={16} style={{ color: '#B8CECF' }} />
                ))}
              </div>
            )}
            {field.type === 'file_upload' && (
              <div style={{ padding: '8px 10px', border: '1px dashed var(--input-border)', borderRadius: 6, fontSize: 12, color: '#B8CECF', textAlign: 'center' }}>
                Click or drag to upload
              </div>
            )}
            {field.type === 'date_picker' && (
              <div style={{ padding: '6px 10px', border: '1px solid var(--input-border)', borderRadius: 6, fontSize: 12, color: '#B8CECF', background: 'white' }}>
                mm/dd/yyyy
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6 }}
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, color: '#e74c3c' }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Form Canvas ----------
interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onDeleteField: (id: string) => void;
  onDuplicateField: (id: string) => void;
}

export default function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDuplicateField,
}: FormCanvasProps) {
  const { setNodeRef } = useDroppable({ id: 'canvas-drop-zone' });

  return (
    <div ref={setNodeRef} style={{ maxWidth: 700, margin: '0 auto', minHeight: 400 }}>
      {fields.length === 0 ? (
        <div
          style={{
            border: '2px dashed var(--input-border)',
            borderRadius: 12,
            padding: '60px 32px',
            textAlign: 'center',
            color: '#52796F',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#263B3B', marginBottom: 8 }}>
            Start building your form
          </h3>
          <p style={{ fontSize: 14, color: '#52796F' }}>
            Drag fields from the left panel or click to add them here.
          </p>
        </div>
      ) : (
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field) => (
            <SortableFieldCard
              key={field.id}
              field={field}
              isSelected={selectedFieldId === field.id}
              onSelect={() => onSelectField(field.id)}
              onDelete={() => onDeleteField(field.id)}
              onDuplicate={() => onDuplicateField(field.id)}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}
