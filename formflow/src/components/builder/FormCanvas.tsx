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
import {
  GripVertical,
  Trash2,
  Copy,
  Star,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// ---------- Sortable Field Card ----------
function SortableFieldCard({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  primaryColor,
}: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  primaryColor?: string;
}) {
  const [hoveredStar, setHoveredStar] = React.useState<number | null>(null);
  const [selectedStar, setSelectedStar] = React.useState<number>(3);
  const lastActionRef = React.useRef<number>(0);

  const handleUpAction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastActionRef.current < 200) return;
    lastActionRef.current = now;
    if (!isFirst && onMoveUp) {
      onMoveUp();
    }
  };

  const handleDownAction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastActionRef.current < 200) return;
    lastActionRef.current = now;
    if (!isLast && onMoveDown) {
      onMoveDown();
    }
  };

  const handleDuplicateAction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastActionRef.current < 200) return;
    lastActionRef.current = now;
    onDuplicate();
  };

  const handleDeleteAction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastActionRef.current < 200) return;
    lastActionRef.current = now;
    onDelete();
  };

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
    position: 'relative',
    zIndex: isDragging ? 99 : 1,
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

  const accentColor = primaryColor || '#8B5CF6';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className="card group transition-all"
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
          background: isSelected ? '#0F172A' : '#1E293B',
          border: isSelected ? '1.5px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: isSelected ? '0 4px 20px rgba(139, 92, 246, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.15s ease',
          color: '#FFFFFF',
        }}
      >
        {/* Drag handle with explicit touch-action & grab cursor */}
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            color: isSelected ? '#C084FC' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: 8,
            touchAction: 'none',
            userSelect: 'none',
            transition: 'all 0.15s ease',
          }}
          className="hover:bg-purple-500/20"
          title="Drag to interswitch position"
        >
          <GripVertical size={18} />
        </div>

        {/* Field content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF' }}>
              {field.label}
            </span>
            {field.required && (
              <span style={{ color: '#EF4444', fontSize: 13, fontWeight: 700 }}>*</span>
            )}
          </div>

          {/* Field type and preview */}
          <div style={{ fontSize: 12, fontWeight: 600, color: '#C084FC', marginBottom: 10 }}>
            {fieldTypeLabel[field.type] || field.type}
          </div>

          {/* Mini preview */}
          <div>
            {field.type === 'welcome_screen' && (
              <div style={{ padding: '8px 12px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 8, fontSize: 12, color: '#C084FC', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                ✨ {field.buttonText || 'Start Quiz'} Button
              </div>
            )}
            {field.type === 'short_text' && (
              <div style={{ padding: '9px 12px', border: '1.5px solid rgba(139, 92, 246, 0.35)', borderRadius: 8, fontSize: 13, color: '#94A3B8', background: '#0F172A' }}>
                {field.placeholder || 'Type your answer...'}
              </div>
            )}
            {field.type === 'paragraph' && (
              <div style={{ padding: '9px 12px', border: '1.5px solid rgba(139, 92, 246, 0.35)', borderRadius: 8, fontSize: 13, color: '#94A3B8', background: '#0F172A', minHeight: 46 }}>
                {field.placeholder || 'Type your detailed answer...'}
              </div>
            )}
            {field.type === 'multiple_choice' && field.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {field.options.slice(0, 4).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#F8FAFC' }}>
                    <div style={{ width: 15, height: 15, borderRadius: field.selectionMode === 'multiple' ? 4 : 8, border: '1.5px solid rgba(139, 92, 246, 0.5)', background: '#0F172A' }} />
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
                <span style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid rgba(139, 92, 246, 0.4)', fontSize: 12, fontWeight: 600, color: '#F8FAFC', background: '#0F172A' }}>
                  [Y] Yes
                </span>
                <span style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid rgba(139, 92, 246, 0.4)', fontSize: 12, fontWeight: 600, color: '#F8FAFC', background: '#0F172A' }}>
                  [N] No
                </span>
              </div>
            )}
            {field.type === 'rating' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onMouseLeave={() => setHoveredStar(null)}>
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const activeRating = hoveredStar !== null ? hoveredStar : selectedStar;
                    const isActive = starIndex <= activeRating;
                    return (
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
                        onMouseEnter={() => setHoveredStar(starIndex)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStar(starIndex);
                        }}
                      >
                        <Star
                          size={22}
                          style={{
                            color: '#F59E0B',
                            fill: isActive ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
                            stroke: isActive ? '#D97706' : '#94A3B8',
                            transition: 'all 0.15s ease',
                          }}
                        />
                      </span>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                  Tap on the stars to rate (1 - 5 stars)
                </div>
              </div>
            )}
            {field.type === 'file_upload' && (
              <div style={{ padding: '12px 14px', border: '1.5px dashed rgba(139, 92, 246, 0.4)', borderRadius: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center', background: '#0F172A' }}>
                📎 Drag and drop file or browse
              </div>
            )}
            {field.type === 'date_picker' && (
              <div style={{ padding: '9px 12px', border: '1.5px solid rgba(139, 92, 246, 0.35)', borderRadius: 8, fontSize: 13, color: '#94A3B8', background: '#0F172A' }}>
                {'📅 mm / dd / yyyy'}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Instant Reorder Interswitch Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* Quick Interswitch Up/Down buttons */}
          <button
            type="button"
            disabled={isFirst}
            onPointerDown={handleUpAction}
            onMouseDown={handleUpAction}
            onClick={handleUpAction}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, opacity: isFirst ? 0.35 : 1, cursor: isFirst ? 'not-allowed' : 'pointer' }}
            title={isFirst ? "First question (cannot move higher)" : "Move question up"}
          >
            <ChevronUp size={16} />
          </button>

          <button
            type="button"
            disabled={isLast}
            onPointerDown={handleDownAction}
            onMouseDown={handleDownAction}
            onClick={handleDownAction}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, opacity: isLast ? 0.35 : 1, cursor: isLast ? 'not-allowed' : 'pointer' }}
            title={isLast ? "Last question (cannot move lower)" : "Move question down"}
          >
            <ChevronDown size={16} />
          </button>

          <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

          <button
            type="button"
            onPointerDown={handleDuplicateAction}
            onMouseDown={handleDuplicateAction}
            onClick={handleDuplicateAction}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6 }}
            title="Duplicate question"
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            onPointerDown={handleDeleteAction}
            onMouseDown={handleDeleteAction}
            onClick={handleDeleteAction}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, color: '#F87171' }}
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
  onMoveField?: (id: string, direction: 'up' | 'down') => void;
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
  onMoveField,
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
          borderRadius: 20,
          overflow: 'hidden',
          background: '#0F172A',
          boxShadow: isFormArmed
            ? '0 0 0 3px #FCA5A5, 0 16px 45px rgba(248, 113, 113, 0.2)'
            : '0 24px 64px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.15)',
          border: isFormArmed
            ? '2px solid #F87171'
            : isOver
            ? '2px dashed #8B5CF6'
            : '1px solid rgba(255, 255, 255, 0.15)',
          cursor: isFormArmed ? 'grab' : 'default',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isFormArmed ? 'scale(0.992)' : 'none',
          position: 'relative',
          color: '#FFFFFF',
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
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.3) 100%)',
              borderBottom: '2px solid #EF4444',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'grab',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#FCA5A5', fontWeight: 700, fontSize: 13 }}>
              <span style={{ fontSize: 18, animation: 'bounce 1s infinite' }}>🖐️</span>
              <span>Form Armed! Click & drag this sheet to the Delete Trash Icon ↘️</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArmForm?.(false);
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: 'none',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                color: '#FCA5A5',
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
              background: '#0B0F19',
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
        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 8, letterSpacing: '-0.02em' }}>
                {title || 'Untitled Form'}
              </h1>
              {description ? (
                <p style={{ color: '#94A3B8', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  {description}
                </p>
              ) : (
                <p style={{ color: '#64748B', fontSize: 13, margin: 0, fontStyle: 'italic' }}>
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
                style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, color: '#C084FC' }}
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
                border: '2px dashed rgba(139, 92, 246, 0.4)',
                borderRadius: 12,
                padding: '48px 24px',
                textAlign: 'center',
                color: '#94A3B8',
                background: isOver ? 'rgba(139, 92, 246, 0.15)' : '#0B0F19',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                Drag and Drop Fields Here
              </h3>
              <p style={{ fontSize: 14, color: '#94A3B8', maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.5 }}>
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
              {fields.map((field, index) => (
                <SortableFieldCard
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => onSelectField(field.id)}
                  onDelete={() => onDeleteField(field.id)}
                  onDuplicate={() => onDuplicateField(field.id)}
                  onMoveUp={() => onMoveField?.(field.id, 'up')}
                  onMoveDown={() => onMoveField?.(field.id, 'down')}
                  isFirst={index === 0}
                  isLast={index === fields.length - 1}
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
