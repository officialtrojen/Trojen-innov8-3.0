'use client';

import React, { useState, useCallback } from 'react';
import { FormSchema, FormField } from '@/lib/types';
import { getVisibleFields, getNextQuestion } from '@/lib/logic-engine';
import { Star, Upload, CheckCircle2, Image as ImageIcon, X, FileText, Calendar } from 'lucide-react';
import { getBackgroundStyle, getCardStyle, isDarkColor } from '@/lib/theme-presets';
import TypeformRenderer from './TypeformRenderer';

interface FormRendererProps {
  schema: FormSchema;
  onSubmit?: (answers: Record<string, unknown>) => Promise<void>;
  readOnly?: boolean;
}

type AnswerValue = string | string[] | number | File | null;

export default function FormRenderer({ schema, onSubmit, readOnly = false }: FormRendererProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isConversational = schema.theme.layout === 'conversational';

  const visibleFields = getVisibleFields(
    schema.fields,
    schema.logic,
    answers as Record<string, string>
  );

  const fontSizeMap = { small: 14, medium: 16, large: 18 };
  const baseFontSize = fontSizeMap[schema.theme.fontSize] || 16;

  const updateAnswer = useCallback((fieldId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  // ---------- Validation ----------
  const validateField = (field: FormField, value: AnswerValue): string | null => {
    if (field.required && (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required.';
    }

    const strValue = typeof value === 'string' ? value : '';

    if (field.type === 'short_text') {
      if (field.validation?.minLength && strValue.length < field.validation.minLength) {
        return `Minimum ${field.validation.minLength} characters required.`;
      }
      if (field.validation?.maxLength && strValue.length > field.validation.maxLength) {
        return `Maximum ${field.validation.maxLength} characters allowed.`;
      }
    }

    if (field.type === 'paragraph') {
      if (field.validation?.charLimit && strValue.length > field.validation.charLimit) {
        return `Maximum ${field.validation.charLimit} characters allowed.`;
      }
    }

    if ((field.type === 'date_picker' || field.type === 'date') && strValue) {
      const date = new Date(strValue);
      if (field.validation?.minDate && date < new Date(field.validation.minDate)) {
        return 'Please select a valid date.';
      }
      if (field.validation?.maxDate && date > new Date(field.validation.maxDate)) {
        return 'Please select a valid date.';
      }
    }

    return null;
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of visibleFields) {
      const err = validateField(field, answers[field.id] ?? null);
      if (err) newErrors[field.id] = err;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !onSubmit) return;

    if (!validateAll()) return;

    setSubmitting(true);
    try {
      // Convert File objects to filenames for storage
      const cleanAnswers: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(answers)) {
        if (val instanceof File) {
          cleanAnswers[key] = val.name;
        } else {
          cleanAnswers[key] = val;
        }
      }
      await onSubmit(cleanAnswers);
      setSubmitted(true);
    } catch {
      setErrors({ _form: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Conversational navigation
  const handleNext = () => {
    const currentField = visibleFields[currentIndex];
    if (currentField) {
      const err = validateField(currentField, answers[currentField.id] ?? null);
      if (err) {
        setErrors({ [currentField.id]: err });
        return;
      }
    }

    const nextIdx = getNextQuestion(
      schema.fields,
      schema.logic,
      answers as Record<string, string>,
      schema.fields.findIndex((f) => f.id === visibleFields[currentIndex]?.id)
    );

    if (nextIdx === 'end' || currentIndex >= visibleFields.length - 1) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // ---------- Success State ----------
  if (submitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: schema.theme.background,
          fontFamily: schema.theme.fontFamily,
          padding: 24,
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 48,
            textAlign: 'center',
            maxWidth: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          <CheckCircle2 size={56} style={{ color: schema.theme.primary, marginBottom: 20 }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, color: schema.theme.text, marginBottom: 12 }}>
            {schema.settings?.successMessage || 'Your response has been recorded.'}
          </h2>
        </div>
      </div>
    );
  }

  // ---------- Interactive Drag & Drop File Upload Field ----------
  function DragDropUploadField({
    field,
    value,
    onChange,
    onError,
    error,
    readOnly,
  }: {
    field: FormField;
    value: AnswerValue;
    onChange: (file: File | null) => void;
    onError: (msg: string | null) => void;
    error?: string;
    readOnly?: boolean;
  }) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFile = (file: File) => {
      // Validate file size
      const maxSize = (field.validation?.maxFileSize || 10) * 1024 * 1024;
      if (file.size > maxSize) {
        onError(`File exceeds maximum size of ${field.validation?.maxFileSize || 10}MB.`);
        return;
      }
      // Validate file type
      if (field.validation?.allowedFileTypes?.length) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext && !field.validation.allowedFileTypes.includes(ext)) {
          onError(`This file type is not supported. Allowed: ${field.validation.allowedFileTypes.join(', ')}`);
          return;
        }
      }
      onError(null);
      onChange(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!readOnly) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (readOnly) return;
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    };

    const currentFile = value instanceof File ? value : null;

    return (
      <div style={{ marginTop: 4 }}>
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!readOnly && !currentFile) {
              document.getElementById(`file-${field.id}`)?.click();
            }
          }}
          style={{
            border: `2px dashed ${
              error
                ? '#EF4444'
                : isDragging
                ? '#0F766E'
                : currentFile
                ? '#10B981'
                : '#94A3B8'
            }`,
            borderRadius: 14,
            padding: '24px 20px',
            textAlign: 'center',
            cursor: readOnly ? 'default' : currentFile ? 'default' : 'pointer',
            background: isDragging
              ? 'rgba(15, 118, 110, 0.08)'
              : currentFile
              ? 'rgba(16, 185, 129, 0.05)'
              : 'rgba(255, 255, 255, 0.85)',
            transition: 'all 0.2s ease',
            boxShadow: isDragging ? '0 0 0 4px rgba(15, 118, 110, 0.15)' : 'none',
          }}
        >
          <input
            id={`file-${field.id}`}
            type="file"
            accept={field.validation?.allowedFileTypes?.map((t) => `.${t}`).join(',') || undefined}
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {currentFile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid #CBD5E1' }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: '#E2E8F0',
                    color: '#0F766E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={24} />
                </div>
              )}
              <div style={{ textAlign: 'left', minWidth: 0, flex: 1, maxWidth: 320 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentFile.name}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  {(currentFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                </div>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                    setPreviewUrl(null);
                  }}
                  style={{
                    background: '#FEE2E2',
                    color: '#DC2626',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <X size={14} /> Remove
                </button>
              )}
            </div>
          ) : (
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  background: isDragging ? '#0F766E' : '#E2E8F0',
                  color: isDragging ? '#FFFFFF' : '#0F766E',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  transition: 'all 0.2s ease',
                }}
              >
                <Upload size={22} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                {isDragging ? 'Drop file to upload!' : 'Drag & drop your files or images here'}
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                or <span style={{ color: '#0F766E', fontWeight: 600, textDecoration: 'underline' }}>browse from your device</span>
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
                Max size: {field.validation?.maxFileSize || 10}MB
                {field.validation?.allowedFileTypes?.length
                  ? ` • Allowed: ${field.validation.allowedFileTypes.join(', ')}`
                  : ''}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- Render Fields ----------
  const renderField = (field: FormField) => {
    const value = answers[field.id];
    const error = errors[field.id];

    return (
      <div key={field.id} style={{ marginBottom: 28, fontFamily: field.fontFamily || undefined }}>
        <label
          style={{
            display: 'block',
            fontSize: baseFontSize,
            fontWeight: 500,
            color: schema.theme.text,
            fontFamily: field.fontFamily || undefined,
            marginBottom: 8,
          }}
        >
          {field.label}
          {field.required && <span style={{ color: '#e74c3c', marginLeft: 4 }}>*</span>}
        </label>

        {field.type === 'short_text' && (
          <input
            type="text"
            className="input"
            value={(value as string) || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            placeholder={field.placeholder}
            readOnly={readOnly}
            style={{
              borderColor: error ? '#EF4444' : '#94A3B8',
              color: '#000000',
              WebkitTextFillColor: '#000000',
              caretColor: '#000000',
              backgroundColor: '#FFFFFF',
              fontWeight: 500,
            }}
          />
        )}

        {field.type === 'paragraph' && (
          <textarea
            className="textarea"
            value={(value as string) || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            placeholder={field.placeholder}
            readOnly={readOnly}
            style={{
              borderColor: error ? '#EF4444' : '#94A3B8',
              color: '#000000',
              WebkitTextFillColor: '#000000',
              caretColor: '#000000',
              backgroundColor: '#FFFFFF',
              fontWeight: 500,
            }}
          />
        )}

        {field.type === 'multiple_choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(field.options || []).map((opt) => {
              const isMulti = field.selectionMode === 'multiple';
              const selectedArr = Array.isArray(value) ? value : [];
              const isChecked = isMulti
                ? selectedArr.includes(opt)
                : value === opt;

              return (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${isChecked ? schema.theme.primary : 'var(--input-border)'}`,
                    background: isChecked ? `${schema.theme.primary}10` : 'white',
                    cursor: readOnly ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: baseFontSize - 1,
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: isMulti ? 4 : 9,
                      border: `2px solid ${isChecked ? schema.theme.primary : 'var(--input-border)'}`,
                      background: isChecked ? schema.theme.primary : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isChecked && (
                      <div style={{ width: 8, height: 8, borderRadius: isMulti ? 2 : 4, background: 'white' }} />
                    )}
                  </div>
                  <input
                    type={isMulti ? 'checkbox' : 'radio'}
                    checked={isChecked}
                    onChange={() => {
                      if (readOnly) return;
                      if (isMulti) {
                        const arr = Array.isArray(value) ? [...value] : [];
                        if (arr.includes(opt)) {
                          updateAnswer(field.id, arr.filter((a) => a !== opt));
                        } else {
                          updateAnswer(field.id, [...arr, opt]);
                        }
                      } else {
                        updateAnswer(field.id, opt);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <span style={{ color: '#000000', fontWeight: 600 }}>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {field.type === 'rating' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((score) => {
                const isFilled = score <= ((value as number) || 0);
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => !readOnly && updateAnswer(field.id, score)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: readOnly ? 'default' : 'pointer',
                      padding: 4,
                      transition: 'transform 0.15s ease',
                      borderRadius: 8,
                    }}
                    onMouseEnter={(e) => {
                      if (!readOnly) (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    }}
                    title={`Rate ${score} of 5 stars`}
                  >
                    <Star
                      size={32}
                      fill={isFilled ? '#F59E0B' : 'none'}
                      stroke={isFilled ? '#F59E0B' : '#B8CECF'}
                    />
                  </button>
                );
              })}
            </div>
            {(value as number) ? (
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>
                ⭐ {value as number} of 5 stars selected
              </span>
            ) : (
              <span style={{ fontSize: 12, color: '#0F766E', fontWeight: 600 }}>
                Tap a star to rate (1 to 5)
              </span>
            )}
          </div>
        )}

        {field.type === 'file_upload' && (
          <DragDropUploadField
            field={field}
            value={value}
            onChange={(file) => updateAnswer(field.id, file)}
            onError={(msg) => setErrors((prev) => ({ ...prev, [field.id]: msg || '' }))}
            error={error}
            readOnly={readOnly}
          />
        )}

        {field.type === 'yes_no' && (
          <div style={{ display: 'flex', gap: 12 }}>
            {['Yes', 'No'].map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !readOnly && updateAnswer(field.id, opt)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: `1.5px solid ${isSelected ? schema.theme.primary : '#94A3B8'}`,
                    background: isSelected ? `${schema.theme.primary}18` : '#FFFFFF',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: readOnly ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt === 'Yes' ? '✓ Yes' : '✗ No'}
                </button>
              );
            })}
          </div>
        )}

        {(field.type === 'date_picker' || field.type === 'date') && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <input
              id={`date-field-${field.id}`}
              type="date"
              className="input"
              value={(value as string) || ''}
              onChange={(e) => updateAnswer(field.id, e.target.value)}
              onClick={(e) => {
                if (!readOnly && 'showPicker' in HTMLInputElement.prototype) {
                  try {
                    e.currentTarget.showPicker();
                  } catch {}
                }
              }}
              readOnly={readOnly}
              min={field.validation?.minDate}
              max={field.validation?.maxDate}
              style={{
                borderColor: error ? '#EF4444' : '#94A3B8',
                color: '#000000',
                WebkitTextFillColor: '#000000',
                backgroundColor: '#FFFFFF',
                colorScheme: 'light',
                fontWeight: 600,
                fontSize: 14,
                cursor: readOnly ? 'default' : 'pointer',
                paddingRight: 42,
              }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                if (!readOnly) {
                  const inputEl = document.getElementById(`date-field-${field.id}`) as HTMLInputElement | null;
                  if (inputEl) {
                    if ('showPicker' in HTMLInputElement.prototype) {
                      try {
                        inputEl.showPicker();
                      } catch {
                        inputEl.focus();
                      }
                    } else {
                      inputEl.focus();
                    }
                  }
                }
              }}
              style={{
                position: 'absolute',
                right: 10,
                background: 'none',
                border: 'none',
                color: '#0F766E',
                cursor: readOnly ? 'default' : 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Open calendar"
            >
              <Calendar size={18} />
            </button>
          </div>
        )}

        {error && <div className="error-text">{error}</div>}
      </div>
    );
  };

  // ---------- Conversational Layout (Typeform Renderer) ----------
  if (isConversational && schema.fields.length > 0) {
    return <TypeformRenderer schema={schema} onSubmit={onSubmit} />;
  }

  const currentPoster = schema.theme.posterUrl || schema.theme.bannerUrl;
  const posterHeight = schema.theme.posterHeight || 180;
  const overlayOpacity = (schema.theme.posterOverlay ?? 20) / 100;
  const isDarkCard = isDarkColor(schema.theme.cardBackground);
  const cardStyle = getCardStyle(schema.theme);

  // ---------- Single Page Layout ----------
  return (
    <div
      className="form-live-render"
      style={{
        minHeight: '100vh',
        fontFamily: schema.theme.fontFamily,
        padding: '48px 32px',
        ...getBackgroundStyle(schema.theme),
      }}
    >
      <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            overflow: 'hidden',
            marginBottom: 48,
            transition: 'box-shadow 0.3s ease',
            ...cardStyle,
          }}
        >
          {/* POSTER / BANNER DISPLAY */}
          {(currentPoster || schema.theme.bannerColor || schema.theme.posterColor || schema.theme.posterTitle || schema.theme.logoUrl) && (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: posterHeight,
                overflow: 'hidden',
                background: schema.theme.bannerColor || schema.theme.posterColor || `linear-gradient(135deg, ${schema.theme.primary || '#8B5CF6'} 0%, #0F172A 100%)`,
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
                  padding: '24px 32px',
                  color: 'white',
                }}
              >
                {/* Left Side: Brand Logo PNG */}
                {schema.theme.logoUrl && (
                  <div
                    style={{
                      position: 'relative',
                      flexShrink: 0,
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
                    }}
                  >
                    <img
                      src={schema.theme.logoUrl}
                      alt="Form logo"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  {schema.theme.posterTitle && (
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {schema.theme.posterTitle}
                    </h2>
                  )}
                  {schema.theme.posterSubtitle && (
                    <p style={{ fontSize: 14, margin: 0, opacity: 0.9, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                      {schema.theme.posterSubtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Content Wrapper with Generous Side Spacing */}
          <div style={{ padding: '40px 48px 44px' }}>
            {/* Header */}
            <h1 style={{ fontSize: baseFontSize + 8, fontWeight: 800, color: schema.theme.text, marginBottom: 8, letterSpacing: '-0.02em' }}>
              {schema.title}
            </h1>
            {schema.description && (
              <p style={{ color: isDarkCard ? 'rgba(255,255,255,0.75)' : '#52796F', fontSize: baseFontSize - 1, marginBottom: 28, lineHeight: 1.6 }}>
                {schema.description}
              </p>
            )}

            {/* Progress bar */}
            {schema.settings?.showProgressBar && visibleFields.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.06)' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 2,
                      background: schema.theme.primary,
                      width: `${(Object.keys(answers).filter((k) => answers[k] !== null && answers[k] !== undefined && answers[k] !== '').length / visibleFields.length) * 100}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Fields with Spacing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {visibleFields.map(renderField)}
            </div>

            {errors._form && (
              <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
                {errors._form}
              </div>
            )}

            {!readOnly && (
              <div style={{ marginTop: 28 }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    background: schema.theme.primary,
                    borderRadius: 12,
                    padding: '14px 24px',
                    fontSize: 15,
                    fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(38, 59, 59, 0.18)',
                  }}
                  disabled={submitting}
                >
                  {submitting ? <span className="spinner" /> : (schema.settings?.submitButtonText || 'Submit')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Branding */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: '#6A8E8C', opacity: 0.85, fontWeight: 500 }}>
          © 2026 FormFlow. Built with ❤️ by team trojen
        </div>
      </form>
    </div>
  );
}
