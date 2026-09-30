'use client';

import React from 'react';
import { FormField } from '@/lib/types';
import { Plus, Trash2, GripVertical, Settings2 } from 'lucide-react';

interface PropertiesPanelProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

export default function PropertiesPanel({ field, onUpdate }: PropertiesPanelProps) {
  return (
    <div
      style={{
        padding: '20px 18px',
        background: '#FFFEF9',
        color: '#263B3B',
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#4F7C7A',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid #B8CECF',
          paddingBottom: 10,
        }}
      >
        <Settings2 size={14} color="#4F7C7A" />
        Question Properties
      </div>

      {/* Question Title */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
          Question Title
        </label>
        <input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 8,
            border: '1.5px solid #B8CECF',
            background: '#FFFEF9',
            color: '#263B3B',
            fontSize: 13,
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
        />
      </div>

      {/* Question Description / Helper Text */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
          Description / Subtitle
        </label>
        <textarea
          rows={2}
          value={field.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Optional instructions or helper text..."
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1.5px solid #B8CECF',
            background: '#FFFEF9',
            color: '#263B3B',
            fontSize: 13,
            outline: 'none',
            resize: 'vertical',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
        />
      </div>

      {/* Welcome Screen Start Button Text */}
      {field.type === 'welcome_screen' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
            Start Button Text
          </label>
          <input
            value={field.buttonText || 'Start Quiz'}
            onChange={(e) => onUpdate({ buttonText: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              border: '1.5px solid #B8CECF',
              background: '#FFFEF9',
              color: '#263B3B',
              fontSize: 13,
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
          />
        </div>
      )}

      {/* Required Toggle */}
      {field.type !== 'welcome_screen' && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 12px',
            background: '#EAF4F4',
            borderRadius: 10,
            border: '1px solid #B8CECF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#263B3B' }}>Required Question</div>
            <div style={{ fontSize: 11, color: '#365F5D' }}>Respondent must answer to proceed</div>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ required: !field.required })}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: '1px solid #B8CECF',
              background: field.required ? '#4F7C7A' : '#CFE5E3',
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
                background: '#FFFEF9',
                position: 'absolute',
                top: 2,
                left: field.required ? 22 : 2,
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(38, 59, 59, 0.2)',
              }}
            />
          </button>
        </div>
      )}

      {/* Placeholder (short_text, paragraph) */}
      {(field.type === 'short_text' || field.type === 'paragraph') && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
            Input Placeholder
          </label>
          <input
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Type your answer..."
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              border: '1.5px solid #B8CECF',
              background: '#FFFEF9',
              color: '#263B3B',
              fontSize: 13,
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
          />
        </div>
      )}

      {/* Validation: min/max length for short_text */}
      {field.type === 'short_text' && (
        <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#365F5D', marginBottom: 4 }}>
              Min Length
            </label>
            <input
              type="number"
              min={0}
              value={field.validation?.minLength || ''}
              onChange={(e) =>
                onUpdate({
                  validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined },
                })
              }
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1.5px solid #B8CECF',
                background: '#FFFEF9',
                color: '#263B3B',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#365F5D', marginBottom: 4 }}>
              Max Length
            </label>
            <input
              type="number"
              min={0}
              value={field.validation?.maxLength || ''}
              onChange={(e) =>
                onUpdate({
                  validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined },
                })
              }
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1.5px solid #B8CECF',
                background: '#FFFEF9',
                color: '#263B3B',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Paragraph character limit */}
      {field.type === 'paragraph' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
            Character Limit
          </label>
          <input
            type="number"
            min={0}
            value={field.validation?.charLimit || ''}
            onChange={(e) =>
              onUpdate({
                validation: { ...field.validation, charLimit: parseInt(e.target.value) || undefined },
              })
            }
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              border: '1.5px solid #B8CECF',
              background: '#FFFEF9',
              color: '#263B3B',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Multiple Choice Options */}
      {field.type === 'multiple_choice' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
              Selection Mode
            </label>
            <div style={{ display: 'flex', gap: 6, background: '#EAF4F4', padding: 3, borderRadius: 8, border: '1px solid #B8CECF' }}>
              {(['single', 'multiple'] as const).map((mode) => {
                const isSelected = field.selectionMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onUpdate({ selectionMode: mode })}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: isSelected ? '#4F7C7A' : 'transparent',
                      color: isSelected ? '#FFFEF9' : '#263B3B',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {mode === 'single' ? 'Single Choice' : 'Multiple Select'}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 8 }}>
              Options (Press A, B, C...)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(field.options || []).map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: '#CFE5E3',
                      color: '#263B3B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(field.options || [])];
                      newOpts[i] = e.target.value;
                      onUpdate({ options: newOpts });
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1.5px solid #B8CECF',
                      background: '#FFFEF9',
                      color: '#263B3B',
                      fontSize: 13,
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOpts = (field.options || []).filter((_, j) => j !== i);
                      onUpdate({ options: newOpts });
                    }}
                    style={{
                      padding: 6,
                      background: 'transparent',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                    }}
                    disabled={(field.options || []).length <= 1}
                    title="Delete option"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`],
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1.5px dashed #4F7C7A',
                  background: '#EAF4F4',
                  color: '#4F7C7A',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  justifyContent: 'center',
                  marginTop: 4,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#CFE5E3'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#EAF4F4'; }}
              >
                <Plus size={14} /> Add Option
              </button>
            </div>
          </div>
        </>
      )}

      {/* Yes / No Information */}
      {field.type === 'yes_no' && (
        <div style={{ marginBottom: 16, padding: '12px 14px', background: '#EAF4F4', borderRadius: 10, border: '1px solid #B8CECF' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 4 }}>Keyboard Hotkeys</div>
          <div style={{ fontSize: 12, color: '#365F5D' }}>
            Users can press <strong style={{ color: '#4F7C7A' }}>[Y]</strong> for Yes and <strong style={{ color: '#4F7C7A' }}>[N]</strong> for No.
          </div>
        </div>
      )}

      {/* Rating Stars Scale */}
      {field.type === 'rating' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
            Rating Scale (Max Stars)
          </label>
          <select
            value={field.maxStars || 5}
            onChange={(e) => onUpdate({ maxStars: parseInt(e.target.value) })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              border: '1.5px solid #B8CECF',
              background: '#FFFEF9',
              color: '#263B3B',
              fontSize: 13,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} Stars</option>
            ))}
          </select>
        </div>
      )}

      {/* File Upload Configuration */}
      {field.type === 'file_upload' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
              Max File Size (MB)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={field.validation?.maxFileSize || 10}
              onChange={(e) =>
                onUpdate({
                  validation: { ...field.validation, maxFileSize: parseInt(e.target.value) || 10 },
                })
              }
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1.5px solid #B8CECF',
                background: '#FFFEF9',
                color: '#263B3B',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 6 }}>
              Allowed File Extensions
            </label>
            <input
              value={(field.validation?.allowedFileTypes || []).join(', ')}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...field.validation,
                    allowedFileTypes: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  },
                })
              }
              placeholder="pdf, png, jpg, zip"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1.5px solid #B8CECF',
                background: '#FFFEF9',
                color: '#263B3B',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
        </>
      )}

      {/* Date Picker Range */}
      {field.type === 'date_picker' && (
        <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#365F5D', marginBottom: 4 }}>
              Min Date
            </label>
            <input
              type="date"
              value={field.validation?.minDate || ''}
              onChange={(e) =>
                onUpdate({
                  validation: { ...field.validation, minDate: e.target.value || undefined },
                })
              }
              style={{
                width: '100%',
                padding: '8px 8px',
                borderRadius: 8,
                border: '1.5px solid #B8CECF',
                background: '#FFFEF9',
                color: '#263B3B',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#365F5D', marginBottom: 4 }}>
              Max Date
            </label>
            <input
              type="date"
              value={field.validation?.maxDate || ''}
              onChange={(e) =>
                onUpdate({
                  validation: { ...field.validation, maxDate: e.target.value || undefined },
                })
              }
              style={{
                width: '100%',
                padding: '8px 8px',
                borderRadius: 8,
                border: '1.5px solid #B8CECF',
                background: '#FFFEF9',
                color: '#263B3B',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
