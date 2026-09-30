'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField, FormTheme } from '@/lib/types';
import { GripVertical, Trash2, Copy, Star, Image as ImageIcon, Plus } from 'lucide-react';
import { getBackgroundStyle } from '@/lib/theme-presets';

// ---------- Sortable Field Card ----------
function SortableFieldCard({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  primaryColor,
}: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  primaryColor?: string;
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
    opacity: isDragging ? 0.35 : 1,
    marginBottom: 12,
  };

  const fieldTypeLabel: Record<string, string> = {
    welcome_screen: 'Welcome Screen',
    short_text: 'Short Text',
    paragraph: 'Paragraph',
    multiple_choice: 'Multiple Choice',
    yes_no: 'Yes / No',
    rating: 'Rating',
    file_upload: 'File Upload',
    date_picker: 'Date Picker',
  };

  const accentColor = primaryColor || '#4F7C7A';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className="group transition-all"
      {...attributes}
    >
      <div
        style={{
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          cursor: 'pointer',
          borderLeft: isSelected ? `4px solid ${accentColor}` : '4px solid transparent',
          borderTop: `1px solid ${isSelected ? '#4F7C7A' : '#B8CECF'}`,
          borderRight: `1px solid ${isSelected ? '#4F7C7A' : '#B8CECF'}`,
          borderBottom: `1px solid ${isSelected ? '#4F7C7A' : '#B8CECF'}`,
          borderRadius: 12,
          background: isSelected ? '#EAF4F4' : '#FFFEF9',
          boxShadow: isSelected ? '0 4px 16px rgba(38, 59, 59, 0.12)' : '0 1px 3px rgba(38, 59, 59, 0.05)',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Drag handle */}
        <div
          {...listeners}
          style={{
            cursor: 'grab',
            color: '#365F5D',
            display: 'flex',
            alignItems: 'center',
            padding: '6px 2px',
          }}
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </div>

        {/* Field content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#263B3B' }}>
              {field.label}
            </span>
            {field.required && (
              <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>*</span>
            )}
          </div>

          {/* Field type and preview */}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#365F5D', marginBottom: 8 }}>
            {fieldTypeLabel[field.type] || field.type}
          </div>

          {/* Mini preview */}
          <div>
            {field.type === 'welcome_screen' && (
              <div style={{ padding: '8px 12px', background: '#CFE5E3', borderRadius: 8, fontSize: 12, color: '#263B3B', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                ✨ {field.buttonText || 'Start Quiz'} Button
              </div>
            )}
            {field.type === 'short_text' && (
              <div style={{ padding: '8px 12px', border: '1px solid #B8CECF', borderRadius: 8, fontSize: 13, color: '#365F5D', background: '#FFFEF9' }}>
                {field.placeholder || 'Type your answer...'}
              </div>
            )}
            {field.type === 'paragraph' && (
              <div style={{ padding: '8px 12px', border: '1px solid #B8CECF', borderRadius: 8, fontSize: 13, color: '#365F5D', background: '#FFFEF9', minHeight: 46 }}>
                {field.placeholder || 'Type your detailed answer...'}
              </div>
            )}
            {field.type === 'multiple_choice' && field.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {field.options.slice(0, 4).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#263B3B' }}>
                    <div style={{ width: 15, height: 15, borderRadius: field.selectionMode === 'multiple' ? 4 : 8, border: '1.5px solid #4F7C7A', background: '#FFFEF9' }} />
                    <span>{opt}</span>
                  </div>
                ))}
                {field.options.length > 4 && (
                  <span style={{ fontSize: 11, color: '#365F5D' }}>+{field.options.length - 4} more options</span>
                )}
              </div>
            )}
            {field.type === 'yes_no' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #B8CECF', fontSize: 12, fontWeight: 700, color: '#263B3B', background: '#FFFEF9' }}>
                  [Y] Yes
                </span>
                <span style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #B8CECF', fontSize: 12, fontWeight: 700, color: '#263B3B', background: '#FFFEF9' }}>
                  [N] No
                </span>
              </div>
            )}
            {field.type === 'rating' && (
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: field.maxStars || 5 }).map((_, i) => (
                  <Star key={i} size={18} style={{ color: '#4F7C7A', fill: '#CFE5E3' }} />
                ))}
              </div>
            )}
            {field.type === 'file_upload' && (
              <div style={{ padding: '12px 14px', border: '1.5px dashed #4F7C7A', borderRadius: 8, fontSize: 12, color: '#365F5D', textAlign: 'center', background: '#EAF4F4' }}>
                📎 Drag and drop file or browse
              </div>
            )}
            {field.type === 'date_picker' && (
              <div style={{ padding: '8px 12px', border: '1px solid #B8CECF', borderRadius: 8, fontSize: 13, color: '#365F5D', background: '#FFFEF9' }}>
                {'📅 mm / dd / yyyy'}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            style={{ padding: 6, background: 'transparent', border: 'none', color: '#365F5D', cursor: 'pointer' }}
            title="Duplicate question"
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ padding: 6, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            title="Delete question"
          >
            <Trash2 size={15} />
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
  theme?: FormTheme;
  title?: string;
  description?: string;
  onOpenThemePanel?: () => void;
  onOpenCrumple?: () => void;
}

export default function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDuplicateField,
  theme,
  title,
  description,
  onOpenThemePanel,
  onOpenCrumple,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

  const currentPoster = theme?.posterUrl || theme?.bannerUrl;
  const posterHeight = theme?.posterHeight || 180;
  const overlayOpacity = (theme?.posterOverlay ?? 25) / 100;

  return (
    <div
      ref={setNodeRef}
      style={{
        maxWidth: 720,
        margin: '0 auto',
        minHeight: 460,
        borderRadius: 16,
        padding: 4,
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Live Form Container */}
      <div
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          background: '#FFFEF9',
          boxShadow: '0 8px 32px rgba(38, 59, 59, 0.1)',
          border: isOver ? '2px dashed #4F7C7A' : '1px solid #B8CECF',
        }}
      >
        {/* POSTER DISPLAY IN FORM HEADER */}
        {currentPoster && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: posterHeight,
              overflow: 'hidden',
              background: '#263B3B',
            }}
          >
            <img
              src={currentPoster}
              alt="Form poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Dark/color tint overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to top, rgba(38,59,59, ${Math.max(0.4, overlayOpacity + 0.2)}), rgba(38,59,59, ${overlayOpacity}))`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '24px 28px',
                color: '#FFFEF9',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,254,249,0.25)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, width: 'fit-content', marginBottom: 8 }}>
                <ImageIcon size={12} /> Poster Active
              </div>
              {theme?.posterTitle && (
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {theme.posterTitle}
                </h2>
              )}
              {theme?.posterSubtitle && (
                <p style={{ fontSize: 13, margin: 0, opacity: 0.9, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                  {theme.posterSubtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form Title & Description Card */}
        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid #B8CECF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: theme?.text || '#263B3B', marginBottom: 8, letterSpacing: '-0.02em' }}>
                {title || 'Untitled Form'}
              </h1>
              {description ? (
                <p style={{ color: '#365F5D', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  {description}
                </p>
              ) : (
                <p style={{ color: '#365F5D', fontSize: 13, margin: 0, fontStyle: 'italic', opacity: 0.8 }}>
                  No description provided. Add form details in settings.
                </p>
              )}
            </div>

            {/* Quick theme trigger button */}
            {onOpenThemePanel && (
              <button
                type="button"
                onClick={onOpenThemePanel}
                style={{
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                  color: '#4F7C7A',
                  background: '#EAF4F4',
                  border: '1px solid #B8CECF',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Customize background & poster"
              >
                <ImageIcon size={14} /> {currentPoster ? 'Edit Poster' : '+ Add Poster'}
              </button>
            )}
          </div>
        </div>

        {/* Form Fields Canvas Area */}
        <div style={{ padding: '24px 32px', minHeight: 260 }}>
          {fields.length === 0 ? (
            <div
              style={{
                border: '2px dashed #4F7C7A',
                borderRadius: 12,
                padding: '48px 24px',
                textAlign: 'center',
                color: '#365F5D',
                background: isOver ? '#CFE5E3' : '#EAF4F4',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#263B3B', marginBottom: 6 }}>
                Drag and Drop Fields Here
              </h3>
              <p style={{ fontSize: 13, color: '#365F5D', maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.5 }}>
                Drag question types from the left palette or click any field type to add it instantly to your form.
              </p>
              {onOpenThemePanel && (
                <button
                  type="button"
                  onClick={onOpenThemePanel}
                  style={{
                    fontSize: 12,
                    borderRadius: 8,
                    padding: '8px 16px',
                    background: '#4F7C7A',
                    color: '#FFFEF9',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🎨 Customize Background & Poster
                </button>
              )}
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
                  primaryColor={theme?.primary}
                />
              ))}
            </SortableContext>
          )}

          {/* 3D Paper Crumple & Discard Drop Zone */}
          {onOpenCrumple && (
            <div
              onClick={onOpenCrumple}
              style={{
                marginTop: 24,
                padding: '16px 20px',
                borderRadius: 12,
                border: '2px dashed #B8CECF',
                background: '#EAF4F4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4F7C7A';
                e.currentTarget.style.background = '#CFE5E3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#B8CECF';
                e.currentTarget.style.background = '#EAF4F4';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#FFFEF9',
                    border: '1.5px solid #B8CECF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4F7C7A',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#263B3B' }}>
                    Crumple & Discard Form in 3D
                  </div>
                  <div style={{ fontSize: 11, color: '#365F5D' }}>
                    Grab and crumple this entire form, drag it into the delete trash icon to open a brand-new editing page
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCrumple();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#4F7C7A',
                  color: '#FFFEF9',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(79, 124, 122, 0.25)',
                }}
              >
                <Trash2 size={13} /> Crumple Form
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
