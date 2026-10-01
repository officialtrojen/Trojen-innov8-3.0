'use client';

import React, { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField, FormTheme } from '@/lib/types';
import { GripVertical, Trash2, Copy, Star, Image as ImageIcon, Plus, Upload, X, Sparkles } from 'lucide-react';
import { getBackgroundStyle, getCardStyle, isDarkColor } from '@/lib/theme-presets';

// ---------- Sortable Field Card ----------
function SortableFieldCard({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  primaryColor,
  themeText,
  isDarkCard = false,
}: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  primaryColor?: string;
  themeText?: string;
  isDarkCard?: boolean;
}) {
  const [hoveredStar, setHoveredStar] = React.useState<number | null>(null);
  const [selectedStar, setSelectedStar] = React.useState<number>(3);
  
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
  const labelColor = field.textColor || themeText || (isDarkCard ? '#F8FAFC' : '#263B3B');

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
          background: isSelected
            ? (isDarkCard ? 'rgba(79, 124, 122, 0.4)' : '#EAF4F4')
            : (isDarkCard ? 'rgba(255, 255, 255, 0.07)' : '#FFFEF9'),
          border: isSelected
            ? '1.5px solid #4F7C7A'
            : (isDarkCard ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid #B8CECF'),
          boxShadow: isSelected
            ? '0 4px 16px rgba(38, 59, 59, 0.08)'
            : (isDarkCard ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(38, 59, 59, 0.04)'),
          transition: 'all 0.15s ease',
        }}
      >
        {/* Drag handle */}
        <div
          {...listeners}
          style={{
            cursor: 'grab',
            color: isDarkCard ? '#94A3B8' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            padding: '6px 2px',
          }}
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </div>

        {/* Field content */}
        <div style={{ flex: 1, minWidth: 0, fontFamily: field.fontFamily || undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: labelColor, fontFamily: field.fontFamily || undefined }}>
              {field.label}
            </span>
            {field.required && (
              <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>*</span>
            )}
            {field.fontFamily && (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: isDarkCard ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                  color: isDarkCard ? '#CBD5E1' : '#475569',
                  fontWeight: 500,
                  fontFamily: field.fontFamily,
                }}
              >
                🔤 {field.fontFamily}
              </span>
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
              <div style={{ padding: '9px 12px', border: '1.5px solid #94A3B8', borderRadius: 8, fontSize: 13, color: '#000000', fontWeight: 600, background: '#FFFFFF' }}>
                {field.placeholder || 'Type your answer...'}
              </div>
            )}
            {field.type === 'paragraph' && (
              <div style={{ padding: '9px 12px', border: '1.5px solid #94A3B8', borderRadius: 8, fontSize: 13, color: '#000000', fontWeight: 600, background: '#FFFFFF', minHeight: 48 }}>
                {field.placeholder || 'Type your detailed answer...'}
              </div>
            )}
            {field.type === 'multiple_choice' && field.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {field.options.slice(0, 4).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#000000', fontWeight: 600 }}>
                    <div style={{ width: 16, height: 16, borderRadius: field.selectionMode === 'multiple' ? 4 : 8, border: '1.5px solid #64748B', background: '#FFFFFF' }} />
                    <span style={{ color: '#000000' }}>{opt}</span>
                  </div>
                ))}
                {field.options.length > 4 && (
                  <span style={{ fontSize: 11, color: '#000000', fontWeight: 600 }}>+{field.options.length - 4} more options</span>
                )}
              </div>
            )}
            {field.type === 'yes_no' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ padding: '6px 14px', borderRadius: 6, border: '1.5px solid #94A3B8', fontSize: 12, fontWeight: 700, color: '#000000', background: '#FFFFFF' }}>
                  [Y] Yes
                </span>
                <span style={{ padding: '6px 14px', borderRadius: 6, border: '1.5px solid #94A3B8', fontSize: 12, fontWeight: 700, color: '#000000', background: '#FFFFFF' }}>
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
                            fill: isActive ? '#F59E0B' : '#EAF4F4',
                            stroke: isActive ? '#D97706' : '#B8CECF',
                            transition: 'all 0.15s ease',
                          }}
                        />
                      </span>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11, color: '#000000', fontWeight: 600 }}>
                  Tap on the stars to rate (1 - 5 stars)
                </div>
              </div>
            )}
            {field.type === 'file_upload' && (
              <div style={{ padding: '12px 14px', border: '1.5px dashed #94A3B8', borderRadius: 8, fontSize: 13, color: '#000000', fontWeight: 600, textAlign: 'center', background: '#FFFFFF' }}>
                📎 Drag and drop file or browse
              </div>
            )}
            {(field.type === 'date_picker' || field.type === 'date') && (
              <div style={{ padding: '9px 12px', border: '1.5px solid #94A3B8', borderRadius: 8, fontSize: 13, color: '#000000', fontWeight: 600, background: '#FFFFFF' }}>
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
            style={{ padding: 6, color: '#f87171' }}
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
  onMoveField?: (fieldId: string, direction: 'up' | 'down') => void;
  theme?: FormTheme;
  title?: string;
  description?: string;
  onOpenThemePanel?: (tab?: 'background' | 'page' | 'poster' | 'colors') => void;
  onUpdateTheme?: (theme: FormTheme) => void;
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
  onUpdateTheme,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });
  const posterFileInputRef = useRef<HTMLInputElement>(null);

  // Handle local poster file upload directly from canvas
  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Poster image exceeds 5MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result && onUpdateTheme) {
        onUpdateTheme({
          ...(theme || {
            background: '#EAF4F4',
            primary: '#8B5CF6',
            secondary: '#475569',
            text: '#0F172A',
            fontFamily: 'Inter',
            fontSize: 'medium',
            layout: 'single-page',
          }),
          posterUrl: result,
          bannerUrl: result,
          posterStyle: theme?.posterStyle || 'card-top',
          posterHeight: theme?.posterHeight || 180,
        });
        onOpenThemePanel?.('poster');
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const currentPoster = theme?.posterUrl || theme?.bannerUrl;
  const posterHeight = theme?.posterHeight || 180;
  const overlayOpacity = (theme?.posterOverlay ?? 20) / 100;

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
      {(() => {
        const isDarkCard = isDarkColor(theme?.cardBackground);
        const cardStyle = getCardStyle(theme);

        return (
          <div
            style={{
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              ...cardStyle,
              border: isOver
                ? '2px dashed var(--primary)'
                : cardStyle.border,
            }}
          >
            {/* POSTER / BANNER DISPLAY IN FORM HEADER */}
            {(currentPoster || theme?.bannerColor || theme?.posterColor || theme?.posterTitle) && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: posterHeight,
                  overflow: 'hidden',
                  background: theme?.bannerColor || theme?.posterColor || `linear-gradient(135deg, ${theme?.primary || '#8B5CF6'} 0%, #0F172A 100%)`,
                }}
              >
                {currentPoster && (
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
                )}
                {/* Dark/color tint overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: currentPoster 
                      ? `linear-gradient(to top, rgba(0,0,0, ${Math.max(0.4, overlayOpacity + 0.2)}), rgba(0,0,0, ${overlayOpacity}))`
                      : 'transparent',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    gap: 16,
                    padding: '20px 24px',
                    color: 'white',
                  }}
                >
                  {/* Left Side: Logo (PNG) Space */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <input
                      type="file"
                      id="canvas-logo-upload"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onUpdateTheme) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              onUpdateTheme({
                                ...(theme || { background: '#EAF4F4', primary: '#8B5CF6', secondary: '#475569', text: '#0F172A', fontFamily: 'Inter', fontSize: 'medium', layout: 'single-page' }),
                                logoUrl: ev.target.result as string,
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    {theme?.logoUrl ? (
                      <div
                        style={{
                          position: 'relative',
                          width: 68,
                          height: 68,
                          borderRadius: 14,
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '2px solid rgba(255, 255, 255, 0.6)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 6,
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                        onClick={() => document.getElementById('canvas-logo-upload')?.click()}
                        title="Click to replace logo PNG"
                      >
                        <img
                          src={theme.logoUrl}
                          alt="Logo"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            if (onUpdateTheme) {
                              onUpdateTheme({ ...(theme as any), logoUrl: undefined });
                            }
                          }}
                          title="Remove logo"
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.65)',
                            border: 'none',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById('canvas-logo-upload')?.click()}
                        title="Click to add a PNG logo in this space"
                        style={{
                          width: 68,
                          height: 68,
                          borderRadius: 14,
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '2px dashed rgba(255, 255, 255, 0.5)',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          transition: 'all 0.2s ease',
                          padding: 4,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)';
                          e.currentTarget.style.borderColor = '#FFFFFF';
                          e.currentTarget.style.transform = 'scale(1.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <Upload size={16} />
                        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1 }}>
                          Add Logo
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Right of Logo: Poster details */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, width: 'fit-content', marginBottom: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                      <ImageIcon size={12} /> {currentPoster ? 'Poster Image' : 'Banner Color Active'}
                    </div>
                    {theme?.posterTitle && (
                      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {theme.posterTitle}
                      </h2>
                    )}
                    {theme?.posterSubtitle && (
                      <p style={{ fontSize: 13, margin: 0, opacity: 0.9, textShadow: '0 1px 3px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {theme.posterSubtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form Title & Description Card */}
            <div
              style={{
                padding: '28px 32px 20px',
                borderBottom: isDarkCard
                  ? '1px solid rgba(255,255,255,0.12)'
                  : '1px solid rgba(184,206,207,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <h1
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: theme?.text || (isDarkCard ? '#F8FAFC' : '#263B3B'),
                      marginBottom: 8,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {title || 'Untitled Form'}
                  </h1>
                  {description ? (
                    <p
                      style={{
                        color: isDarkCard ? 'rgba(255,255,255,0.75)' : '#52796F',
                        fontSize: 14,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {description}
                    </p>
                  ) : (
                    <p
                      style={{
                        color: isDarkCard ? 'rgba(255,255,255,0.45)' : '#94A3B8',
                        fontSize: 13,
                        margin: 0,
                        fontStyle: 'italic',
                      }}
                    >
                      No description provided. Add form details in settings.
                    </p>
                  )}
                </div>

                {/* Quick Poster trigger & actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <input
                    ref={posterFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => posterFileInputRef.current?.click()}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: isDarkCard ? '1px solid rgba(255,255,255,0.2)' : '1px solid #B8CECF',
                      background: isDarkCard ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                      color: isDarkCard ? '#F8FAFC' : '#0F766E',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease',
                    }}
                    title="Upload poster image from your device"
                  >
                    <ImageIcon size={14} />
                    {currentPoster ? 'Change Poster' : '+ Add Poster'}
                  </button>

                  {onOpenThemePanel && (
                    <button
                      type="button"
                      onClick={() => onOpenThemePanel('poster')}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid transparent',
                        background: 'transparent',
                        color: isDarkCard ? '#94A3B8' : '#52796F',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Browse curated poster presets, styles, and dimensions"
                    >
                      <Sparkles size={13} />
                      Presets
                    </button>
                  )}

                  {currentPoster && onUpdateTheme && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateTheme({
                          ...(theme as any),
                          posterUrl: undefined,
                          bannerUrl: undefined,
                        });
                      }}
                      style={{
                        fontSize: 11,
                        color: '#EF4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        borderRadius: 6,
                      }}
                      title="Remove current poster"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields Canvas Area */}
            <div style={{ padding: '24px 32px', minHeight: 260 }}>
              {fields.length === 0 ? (
                <div
                  style={{
                    border: isDarkCard ? '2px dashed rgba(255,255,255,0.2)' : '2px dashed rgba(184,206,207,0.6)',
                    borderRadius: 12,
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: isDarkCard ? '#94A3B8' : '#52796F',
                    background: isOver
                      ? (isDarkCard ? 'rgba(79,124,122,0.2)' : 'rgba(207,229,227,0.2)')
                      : (isDarkCard ? 'rgba(255,255,255,0.04)' : '#FBFDFD'),
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: isDarkCard ? '#F8FAFC' : '#263B3B', marginBottom: 6 }}>
                    Drag and Drop Fields Here
                  </h3>
                  <p style={{ fontSize: 13, color: isDarkCard ? 'rgba(255,255,255,0.6)' : '#64748B', maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.5 }}>
                    Drag question types from the left palette or click any field type to add it instantly to your form.
                  </p>
                  {onOpenThemePanel && (
                    <button
                      type="button"
                      onClick={onOpenThemePanel}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 8,
                        padding: '8px 16px',
                        background: '#0F766E',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 8px rgba(15, 118, 110, 0.3)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#115E59';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0F766E';
                      }}
                    >
                      🎨 Customize Appearance
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
                      themeText={theme?.text}
                      isDarkCard={isDarkCard}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
