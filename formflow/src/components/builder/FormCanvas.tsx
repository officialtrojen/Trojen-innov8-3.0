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
      className="card group transition-all"
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
          borderRadius: 'var(--radius)',
          background: isSelected ? '#EAF4F4' : '#FFFEF9',
          border: isSelected ? '1.5px solid #4F7C7A' : '1px solid #B8CECF',
          boxShadow: isSelected ? '0 4px 16px rgba(38, 59, 59, 0.08)' : '0 1px 3px rgba(38, 59, 59, 0.04)',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Drag handle */}
        <div
          {...listeners}
          style={{
            cursor: 'grab',
            color: '#94A3B8',
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
            <span style={{ fontWeight: 600, fontSize: 14, color: '#263B3B' }}>
              {field.label}
            </span>
            {field.required && (
              <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>*</span>
            )}
          </div>

          {/* Field type and preview */}
          <div style={{ fontSize: 11, fontWeight: 500, color: '#52796F', marginBottom: 8 }}>
            {fieldTypeLabel[field.type] || field.type}
          </div>

          {/* Mini preview */}
          <div>
            {field.type === 'welcome_screen' && (
              <div style={{ padding: '8px 12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 8, fontSize: 12, color: '#0284C7', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                ✨ {field.buttonText || 'Start Quiz'} Button
              </div>
            )}
            {field.type === 'short_text' && (
              <div style={{ padding: '8px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 13, color: '#94A3B8', background: 'white' }}>
                {field.placeholder || 'Type your answer...'}
              </div>
            )}
            {field.type === 'paragraph' && (
              <div style={{ padding: '8px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 13, color: '#94A3B8', background: 'white', minHeight: 46 }}>
                {field.placeholder || 'Type your detailed answer...'}
              </div>
            )}
            {field.type === 'multiple_choice' && field.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {field.options.slice(0, 4).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#263B3B' }}>
                    <div style={{ width: 15, height: 15, borderRadius: field.selectionMode === 'multiple' ? 4 : 8, border: '1.5px solid var(--input-border)' }} />
                    <span>{opt}</span>
                  </div>
                ))}
                {field.options.length > 4 && (
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>+{field.options.length - 4} more options</span>
                )}
              </div>
            )}
            {field.type === 'yes_no' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--input-border)', fontSize: 12, fontWeight: 600, color: '#263B3B', background: 'white' }}>
                  [Y] Yes
                </span>
                <span style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--input-border)', fontSize: 12, fontWeight: 600, color: '#263B3B', background: 'white' }}>
                  [N] No
                </span>
              </div>
            )}
            {field.type === 'rating' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <span
                      key={starIndex}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                      }}
                      title={`Star ${starIndex}`}
                    >
                      <Star
                        size={22}
                        style={{
                          color: '#F59E0B',
                          fill: starIndex <= 3 ? '#F59E0B' : '#EAF4F4',
                          stroke: starIndex <= 3 ? '#D97706' : '#B8CECF',
                          transition: 'all 0.15s ease',
                        }}
                      />
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#365F5D', fontWeight: 600 }}>
                  Tap on the stars to rate (1 - 5 stars)
                </div>
              </div>
            )}
            {field.type === 'file_upload' && (
              <div style={{ padding: '12px 14px', border: '1.5px dashed var(--input-border)', borderRadius: 8, fontSize: 12, color: '#64748B', textAlign: 'center', background: '#F8FAFC' }}>
                📎 Drag and drop file or browse
              </div>
            )}
            {field.type === 'date_picker' && (
              <div style={{ padding: '8px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 13, color: '#94A3B8', background: 'white' }}>
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
            className="btn btn-ghost btn-sm"
            style={{ padding: 6 }}
            title="Duplicate question"
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, color: '#ef4444' }}
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
  isFormArmed?: boolean;
  onArmForm?: (armed: boolean) => void;
  onStartDragForm?: (e: React.PointerEvent) => void;
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
  isFormArmed = false,
  onArmForm,
  onStartDragForm,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });
  const lastClickRef = React.useRef<number>(0);

  const currentPoster = theme?.posterUrl || theme?.bannerUrl;
  const posterHeight = theme?.posterHeight || 180;
  const overlayOpacity = (theme?.posterOverlay ?? 20) / 100;

  // Track two fast clicks (within 650ms) to arm the form
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select, a, [role="button"]')) {
      return;
    }
    const now = Date.now();
    if (now - lastClickRef.current < 650) {
      onArmForm?.(!isFormArmed);
      lastClickRef.current = 0;
    } else {
      lastClickRef.current = now;
    }
  };

  // Standard double-click fallback
  const handleContainerDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select, a, [role="button"]')) {
      return;
    }
    onArmForm?.(!isFormArmed);
  };

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
        onClick={handleContainerClick}
        onDoubleClick={handleContainerDoubleClick}
        onPointerDown={(e) => {
          if (isFormArmed) {
            const target = e.target as HTMLElement;
            if (!target.closest('button, input, textarea, select, a, [role="button"]')) {
              onStartDragForm?.(e);
            }
          }
        }}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          background: 'white',
          boxShadow: isFormArmed
            ? '0 0 0 3px #E74C3C, 0 16px 45px rgba(231, 76, 60, 0.25)'
            : '0 8px 30px rgba(38, 59, 59, 0.08)',
          border: isFormArmed
            ? '2.5px solid #E74C3C'
            : isOver
            ? '2px dashed var(--primary)'
            : '1px solid rgba(184,206,207,0.4)',
          cursor: isFormArmed ? 'grab' : 'default',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isFormArmed ? 'scale(0.992)' : 'none',
          position: 'relative',
        }}
      >
        {/* ARMED FORM BANNER FOR DRAGGING TO TRASH */}
        {isFormArmed && (
          <div
            onPointerDown={(e) => {
              e.preventDefault();
              onStartDragForm?.(e);
            }}
            style={{
              background: 'linear-gradient(135deg, #FDEDEC 0%, #FADBD8 100%)',
              borderBottom: '2px solid #E74C3C',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'grab',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#C0392B', fontWeight: 700, fontSize: 13 }}>
              <span style={{ fontSize: 18, animation: 'bounce 1s infinite' }}>🖐️</span>
              <span>Form Armed! Click & drag this sheet to the red Delete Trash Icon ↘️</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArmForm?.(false);
              }}
              style={{
                background: 'rgba(231, 76, 60, 0.15)',
                border: 'none',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                color: '#C0392B',
                cursor: 'pointer',
              }}
            >
              ✕ Cancel
            </button>
          </div>
        )}

        {/* POSTER DISPLAY IN FORM HEADER */}
        {currentPoster && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: posterHeight,
              overflow: 'hidden',
              background: '#0F172A',
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
                background: `linear-gradient(to top, rgba(0,0,0, ${Math.max(0.4, overlayOpacity + 0.2)}), rgba(0,0,0, ${overlayOpacity}))`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '24px 28px',
                color: 'white',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, width: 'fit-content', marginBottom: 8 }}>
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
        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid rgba(184,206,207,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: theme?.text || '#263B3B', marginBottom: 8, letterSpacing: '-0.02em' }}>
                {title || 'Untitled Form'}
              </h1>
              {description ? (
                <p style={{ color: '#52796F', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  {description}
                </p>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: 13, margin: 0, fontStyle: 'italic' }}>
                  No description provided. Add form details in settings.
                </p>
              )}
            </div>

            {/* Quick theme trigger button */}
            {onOpenThemePanel && (
              <button
                type="button"
                onClick={onOpenThemePanel}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, color: '#52796F' }}
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
                border: '2px dashed rgba(184,206,207,0.6)',
                borderRadius: 12,
                padding: '48px 24px',
                textAlign: 'center',
                color: '#52796F',
                background: isOver ? 'rgba(207,229,227,0.2)' : '#FBFDFD',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
                Drag and Drop Fields Here
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.5 }}>
                Drag question types from the left palette or click any field type to add it instantly to your form.
              </p>
              {onOpenThemePanel && (
                <button
                  type="button"
                  onClick={onOpenThemePanel}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12, borderRadius: 8 }}
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
        </div>
      </div>
    </div>
  );
}
