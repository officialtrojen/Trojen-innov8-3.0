'use client';

import React from 'react';
import { FormField } from '@/lib/types';
import { Plus, Trash2, GripVertical, Settings2, Type, Check } from 'lucide-react';

export const FIELD_FONT_OPTIONS = [
  {
    name: 'Inter',
    label: 'Inter',
    category: 'Modern Sans',
    sample: 'Ag',
    family: "'Inter', sans-serif",
  },
  {
    name: 'Poppins',
    label: 'Poppins',
    category: 'Geometric Rounded',
    sample: 'Ag',
    family: "'Poppins', sans-serif",
  },
  {
    name: 'Outfit',
    label: 'Outfit',
    category: 'Clean Display',
    sample: 'Ag',
    family: "'Outfit', sans-serif",
  },
  {
    name: 'Playfair Display',
    label: 'Playfair Display',
    category: 'Editorial Serif',
    sample: 'Ag',
    family: "'Playfair Display', serif",
  },
  {
    name: 'Space Grotesk',
    label: 'Space Grotesk',
    category: 'Neo-Brutalist',
    sample: 'Ag',
    family: "'Space Grotesk', sans-serif",
  },
];

interface PropertiesPanelProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onEditFormSettings?: () => void;
  onDelete?: () => void;
}

export default function PropertiesPanel({
  field,
  onUpdate,
  onEditFormSettings,
  onDelete,
}: PropertiesPanelProps) {
  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#0F766E',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
          }}
        >
          Field Properties
        </div>
        {onEditFormSettings && (
          <button
            type="button"
            onClick={onEditFormSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(82, 121, 111, 0.1)',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              color: '#263B3B',
              cursor: 'pointer',
            }}
          >
            <Settings2 size={12} /> Form Title
          </button>
        )}
      </div>

      {/* Question Label */}
      <div style={{ marginBottom: 16 }}>
        <label className="label">Question Title</label>
        <input
          className="input"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      {/* Question Description / Helper Text */}
      <div style={{ marginBottom: 16 }}>
        <label className="label">Description / Subtitle</label>
        <textarea
          className="textarea"
          rows={2}
          value={field.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Optional helper text or instructions..."
        />
      </div>

      {/* Field Font Typography (5 Font Options) */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label className="label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Type size={14} style={{ color: '#0F766E' }} />
            <span>Field Font (5 Options)</span>
          </label>
          {field.fontFamily && (
            <button
              onClick={() => onUpdate({ fontFamily: undefined })}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#0F766E',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
              title="Reset to default theme font"
            >
              Reset to default
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {FIELD_FONT_OPTIONS.map((font) => {
            const isSelected = field.fontFamily === font.name;
            return (
              <button
                key={font.name}
                type="button"
                onClick={() => onUpdate({ fontFamily: font.name })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: isSelected ? '2px solid #0F766E' : '1.5px solid #CBD5E1',
                  background: isSelected ? '#F0FDFA' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 1px 4px rgba(15,118,110,0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: isSelected ? '#0F766E' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      fontFamily: font.family,
                      flexShrink: 0,
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    {font.sample}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: font.family,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0F172A',
                        lineHeight: 1.2,
                      }}
                    >
                      {font.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', fontWeight: 500, marginTop: 2 }}>
                      {font.category}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: '#0F766E',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Welcome Screen Button Text */}
      {field.type === 'welcome_screen' && (
        <div style={{ marginBottom: 16 }}>
          <label className="label">Start Button Text</label>
          <input
            className="input"
            value={field.buttonText || 'Start Quiz'}
            onChange={(e) => onUpdate({ buttonText: e.target.value })}
          />
        </div>
      )}

      {/* Required Toggle */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label className="label" style={{ marginBottom: 0 }}>Required</label>
        <button
          type="button"
          onClick={() => onUpdate({ required: !field.required })}
          style={{
            width: 46,
            height: 26,
            borderRadius: 13,
            border: 'none',
            background: field.required ? '#0F766E' : '#94A3B8',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s ease',
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              background: 'white',
              position: 'absolute',
              top: 3,
              left: field.required ? 23 : 3,
              transition: 'left 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
            }}
          />
        </button>
      </div>

      {/* Placeholder (short_text, paragraph) */}
      {(field.type === 'short_text' || field.type === 'paragraph') && (
        <div style={{ marginBottom: 16 }}>
          <label className="label">Placeholder</label>
          <input
            className="input"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Enter placeholder text..."
          />
        </div>
      )}

      {/* Validation: min/max length */}
      {field.type === 'short_text' && (
        <>
          <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="label">Min Length</label>
              <input
                className="input"
                type="number"
                min={0}
                value={field.validation?.minLength || ''}
                onChange={(e) =>
                  onUpdate({
                    validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined },
                  })
                }
              />
            </div>
            <div>
              <label className="label">Max Length</label>
              <input
                className="input"
                type="number"
                min={0}
                value={field.validation?.maxLength || ''}
                onChange={(e) =>
                  onUpdate({
                    validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined },
                  })
                }
              />
            </div>
          </div>
        </>
      )}

      {/* Paragraph char limit */}
      {field.type === 'paragraph' && (
        <div style={{ marginBottom: 16 }}>
          <label className="label">Character Limit</label>
          <input
            className="input"
            type="number"
            min={0}
            value={field.validation?.charLimit || ''}
            onChange={(e) =>
              onUpdate({
                validation: { ...field.validation, charLimit: parseInt(e.target.value) || undefined },
              })
            }
          />
        </div>
      )}

      {/* Multiple Choice Options */}
      {field.type === 'multiple_choice' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="label" style={{ marginBottom: 0 }}>Selection Mode</label>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['single', 'multiple'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onUpdate({ selectionMode: mode })}
                  className="btn btn-sm"
                  style={{
                    background: field.selectionMode === mode ? '#0F766E' : '#FFFFFF',
                    color: field.selectionMode === mode ? '#FFFFFF' : '#0F172A',
                    border: `1.5px solid ${field.selectionMode === mode ? '#0F766E' : '#94A3B8'}`,
                    fontWeight: 700,
                    flex: 1,
                  }}
                >
                  {mode === 'single' ? 'Single Choice' : 'Multiple Choice'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(field.options || []).map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ color: '#64748B', cursor: 'grab', padding: 2 }}>
                    <GripVertical size={14} />
                  </div>
                  <input
                    className="input"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(field.options || [])];
                      newOpts[i] = e.target.value;
                      onUpdate({ options: newOpts });
                    }}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOpts = (field.options || []).filter((_, j) => j !== i);
                      onUpdate({ options: newOpts });
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: 4, color: '#DC2626' }}
                    disabled={(field.options || []).length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onUpdate({ options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })}
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', color: '#0F766E', fontWeight: 700 }}
              >
                <Plus size={15} /> Add Option
              </button>
            </div>
          </div>
        </>
      )}

      {/* Rating Stars - Standard 5-Star Rating */}
      {field.type === 'rating' && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 10,
            background: '#F0FDFA',
            border: '1.5px solid #99F6E4',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0F766E', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
            <span>⭐ Standard 5-Star Rating</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#134E4A', lineHeight: 1.5, fontWeight: 500 }}>
            Fixed to standard 5 stars. Respondents tap directly on any of the 5 interactive stars to submit their rating.
          </p>
        </div>
      )}

      {/* File Upload */}
      {field.type === 'file_upload' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Max File Size (MB)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={100}
              value={field.validation?.maxFileSize || 10}
              onChange={(e) =>
                onUpdate({
                  validation: { ...field.validation, maxFileSize: parseInt(e.target.value) || 10 },
                })
              }
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Allowed File Types</label>
            <input
              className="input"
              value={(field.validation?.allowedFileTypes || []).join(', ')}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...field.validation,
                    allowedFileTypes: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  },
                })
              }
              placeholder="e.g. pdf, jpg, png (leave empty for all)"
            />
          </div>
        </>
      )}

      {/* Date Picker */}
      {field.type === 'date_picker' && (
        <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">Min Date</label>
            <input
              className="input"
              type="date"
              value={field.validation?.minDate || ''}
              onChange={(e) =>
                onUpdate({
                  validation: { ...field.validation, minDate: e.target.value || undefined },
                })
              }
            />
          </div>
          <div>
            <label className="label">Max Date</label>
            <input
              className="input"
              type="date"
              value={field.validation?.maxDate || ''}
              onChange={(e) =>
                onUpdate({
                  validation: { ...field.validation, maxDate: e.target.value || undefined },
                })
              }
            />
          </div>
        </div>
      )}

      {onDelete && (
        <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid #B8CECF' }}>
          <button
            type="button"
            onClick={onDelete}
            className="btn btn-ghost btn-sm"
            style={{
              width: '100%',
              color: '#EF4444',
              borderColor: 'rgba(239, 68, 68, 0.35)',
              background: 'rgba(239, 68, 68, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Delete this question"
          >
            <Trash2 size={15} />
            <span>Delete Question</span>
          </button>
        </div>
      )}
    </div>
  );
}
