'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField } from '@/types/form';
import { 
  GripVertical, 
  Trash2, 
  Copy, 
  Star, 
  UploadCloud, 
  Calendar, 
  Type, 
  AlignLeft, 
  CheckSquare,
  AlertCircle
} from 'lucide-react';

interface SortableFieldItemProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  index,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const renderFieldPreview = () => {
    switch (field.type) {
      case 'short_text':
        return (
          <div className="w-full h-10 px-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 text-xs text-zinc-500 flex items-center">
            {field.placeholder || 'Respondent short text answer...'}
          </div>
        );
      case 'paragraph':
        return (
          <div className="w-full h-20 p-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 text-xs text-zinc-500">
            {field.placeholder || 'Respondent multi-line detailed answer...'}
          </div>
        );
      case 'multiple_choice':
        return (
          <div className="space-y-1.5 mt-2">
            {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950/30 text-xs text-zinc-400"
              >
                <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 flex-shrink-0" />
                <span>{opt}</span>
              </div>
            ))}
          </div>
        );
      case 'rating':
        return (
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-zinc-950/50 border border-zinc-800 text-amber-400 flex items-center justify-center"
              >
                <Star className="w-5 h-5 fill-amber-400/20" />
              </div>
            ))}
            <span className="text-xs text-zinc-500 ml-2">1 to 5 stars</span>
          </div>
        );
      case 'file_upload':
        return (
          <div className="w-full p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/30 flex flex-col items-center justify-center gap-1.5 text-center">
            <UploadCloud className="w-6 h-6 text-zinc-500" />
            <div className="text-xs text-zinc-400 font-medium">Click or drag file to upload</div>
            <div className="text-[10px] text-zinc-600">Supports PDF, PNG, JPG, ZIP up to 25MB</div>
          </div>
        );
      case 'date':
        return (
          <div className="w-full h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-950/40 text-xs text-zinc-500 flex items-center justify-between">
            <span>YYYY-MM-DD</span>
            <Calendar className="w-4 h-4 text-zinc-500" />
          </div>
        );
      default:
        return null;
    }
  };

  const getFieldIcon = () => {
    switch (field.type) {
      case 'short_text': return Type;
      case 'paragraph': return AlignLeft;
      case 'multiple_choice': return CheckSquare;
      case 'rating': return Star;
      case 'file_upload': return UploadCloud;
      case 'date': return Calendar;
      default: return Type;
    }
  };

  const FieldIcon = getFieldIcon();

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-indigo-500 bg-zinc-900/90 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/70'
      } p-4 mb-3`}
    >
      {/* Header with drag handle, index, title and actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 -ml-1 text-zinc-500 hover:text-zinc-200 cursor-grab active:cursor-grabbing rounded hover:bg-zinc-800/80 transition-colors"
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-medium text-zinc-500">
            Q{index + 1}
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
            <FieldIcon className="w-3 h-3 text-indigo-400" />
            {field.type.replace('_', ' ')}
          </span>

          {field.required && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Required
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Duplicate question"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Label */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-white flex items-baseline gap-1">
          {field.label || 'Untitled Question'}
          {field.required && <span className="text-rose-400">*</span>}
        </h3>
        {field.description && (
          <p className="text-xs text-zinc-400 mt-0.5">{field.description}</p>
        )}
      </div>

      {/* Field Control Preview */}
      <div className="mt-2.5 pointer-events-none">{renderFieldPreview()}</div>
    </div>
  );
};
