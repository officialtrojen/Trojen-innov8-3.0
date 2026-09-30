'use client';

import React from 'react';
import { FormField } from '@/lib/types';
import { Plus, Trash2, GripVertical, Type, Check } from 'lucide-react';
import { FIELD_FONT_OPTIONS } from '@/lib/font-presets';

interface PropertiesPanelProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

export default function PropertiesPanel({ field, onUpdate }: PropertiesPanelProps) {
  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#52796F',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 20,
        }}
      >
        Field Properties
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

      {/* Typography / Font Family (10 distinct options) */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label className="label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Type size={14} style={{ color: '#4F7C7A' }} />
            <span>Field Typography (Font)</span>
          </label>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 4,
              background: '#CFE5E3',
              color: '#263B3B',
            }}
          >
            10 Fonts
          </span>
        </div>

        {/* Selected Font Preview Box */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginBottom: 2 }}>
              Active Font
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#1E293B',
                fontFamily: field.fontFamily || 'inherit',
              }}
            >
              {field.fontFamily || 'Theme Default'}
            </div>
          </div>
          {field.fontFamily ? (
            <button
              type="button"
              onClick={() => onUpdate({ fontFamily: undefined })}
              style={{
                fontSize: 11,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#64748B',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              title="Reset to default theme font"
            >
              Reset
            </button>
          ) : (
            <span style={{ fontSize: 11, color: '#94A3B8' }}>Default</span>
          )}
        </div>

        {/* 10 Font Choices List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: 250,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {FIELD_FONT_OPTIONS.map((f) => {
            const isSelected = field.fontFamily === f.name;
            return (
              <button
                key={f.name}
                type="button"
                onClick={() => onUpdate({ fontFamily: f.name })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: isSelected ? '2px solid #1E293B' : '1px solid #E2E8F0',
                  background: isSelected ? '#F1F5F9' : '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span
                      style={{
                        fontFamily: f.name,
                        fontSize: 13,
                        fontWeight: 600,
                        color: isSelected ? '#0F172A' : '#334155',
                      }}
                    >
                      {f.label}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: isSelected ? '#CBD5E1' : '#F1F5F9',
                        color: '#64748B',
                        fontWeight: 600,
                      }}
                    >
                      {f.category}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: f.name,
                      fontSize: 11,
                      color: isSelected ? '#334155' : '#64748B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {f.sample}
                  </div>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      background: '#1E293B',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    <Check size={11} strokeWidth={3} />
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
          onClick={() => onUpdate({ required: !field.required })}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            border: 'none',
            background: field.required ? 'var(--primary)' : '#B8CECF',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s ease',
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: 'white',
              position: 'absolute',
              top: 3,
              left: field.required ? 23 : 3,
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
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
                  onClick={() => onUpdate({ selectionMode: mode })}
                  className="btn btn-sm"
                  style={{
                    background: field.selectionMode === mode ? 'var(--primary)' : 'transparent',
                    color: field.selectionMode === mode ? 'white' : 'var(--text-main)',
                    border: `1px solid ${field.selectionMode === mode ? 'var(--primary)' : 'var(--input-border)'}`,
                    flex: 1,
                  }}
                >
                  {mode === 'single' ? 'Single' : 'Multiple'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(field.options || []).map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ color: '#B8CECF', cursor: 'grab', padding: 2 }}>
                    <GripVertical size={12} />
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
                    onClick={() => {
                      const newOpts = (field.options || []).filter((_, j) => j !== i);
                      onUpdate({ options: newOpts });
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: 4, color: '#f87171' }}
                    disabled={(field.options || []).length <= 1}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => onUpdate({ options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })}
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', color: 'var(--primary)' }}
              >
                <Plus size={14} /> Add Option
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
            background: '#EAF4F4',
            border: '1.5px solid #B8CECF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#263B3B', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            <span>⭐ Standard 5-Star Rating</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#365F5D', lineHeight: 1.5 }}>
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
    </div>
  );
}
