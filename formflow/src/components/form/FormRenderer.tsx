'use client';

import React, { useState, useCallback } from 'react';
import { FormSchema, FormField } from '@/lib/types';
import { getVisibleFields, getNextQuestion } from '@/lib/logic-engine';
import { Star, Upload, CheckCircle2 } from 'lucide-react';

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

    if (field.type === 'date_picker' && strValue) {
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
            {schema.settings.successMessage}
          </h2>
        </div>
      </div>
    );
  }

  // ---------- Render Fields ----------
  const renderField = (field: FormField) => {
    const value = answers[field.id];
    const error = errors[field.id];

    return (
      <div key={field.id} style={{ marginBottom: 28 }}>
        <label
          style={{
            display: 'block',
            fontSize: baseFontSize,
            fontWeight: 500,
            color: schema.theme.text,
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
            style={{ borderColor: error ? '#e74c3c' : undefined }}
          />
        )}

        {field.type === 'paragraph' && (
          <textarea
            className="textarea"
            value={(value as string) || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            placeholder={field.placeholder}
            readOnly={readOnly}
            style={{ borderColor: error ? '#e74c3c' : undefined }}
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
                  {opt}
                </label>
              );
            })}
          </div>
        )}

        {field.type === 'rating' && (
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: field.maxStars || 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => !readOnly && updateAnswer(field.id, i + 1)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: readOnly ? 'default' : 'pointer',
                  padding: 2,
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => { if (!readOnly) (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              >
                <Star
                  size={28}
                  fill={i < (value as number || 0) ? '#F5A623' : 'none'}
                  stroke={i < (value as number || 0) ? '#F5A623' : '#B8CECF'}
                />
              </button>
            ))}
          </div>
        )}

        {field.type === 'file_upload' && (
          <div
            style={{
              border: `2px dashed ${error ? '#e74c3c' : 'var(--input-border)'}`,
              borderRadius: 10,
              padding: 24,
              textAlign: 'center',
              cursor: readOnly ? 'default' : 'pointer',
              background: 'rgba(255,255,255,0.5)',
            }}
            onClick={() => {
              if (readOnly) return;
              document.getElementById(`file-${field.id}`)?.click();
            }}
          >
            <Upload size={24} style={{ color: '#B8CECF', marginBottom: 8 }} />
            <div style={{ fontSize: 13, color: '#52796F' }}>
              {value instanceof File ? (value as File).name : 'Click or drag to upload a file'}
            </div>
            <input
              id={`file-${field.id}`}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file size
                  const maxSize = (field.validation?.maxFileSize || 10) * 1024 * 1024;
                  if (file.size > maxSize) {
                    setErrors((prev) => ({ ...prev, [field.id]: `File exceeds maximum size of ${field.validation?.maxFileSize || 10}MB.` }));
                    return;
                  }
                  // Validate file type
                  if (field.validation?.allowedFileTypes?.length) {
                    const ext = file.name.split('.').pop()?.toLowerCase();
                    if (ext && !field.validation.allowedFileTypes.includes(ext)) {
                      setErrors((prev) => ({ ...prev, [field.id]: 'This file type is not supported.' }));
                      return;
                    }
                  }
                  updateAnswer(field.id, file);
                }
              }}
            />
          </div>
        )}

        {field.type === 'date_picker' && (
          <input
            type="date"
            className="input"
            value={(value as string) || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            readOnly={readOnly}
            min={field.validation?.minDate}
            max={field.validation?.maxDate}
            style={{ borderColor: error ? '#e74c3c' : undefined }}
          />
        )}

        {error && <div className="error-text">{error}</div>}
      </div>
    );
  };

  // ---------- Conversational Layout ----------
  if (isConversational && visibleFields.length > 0) {
    const currentField = visibleFields[currentIndex];
    if (!currentField) return null;

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
        <div style={{ maxWidth: 600, width: '100%' }}>
          {/* Progress */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#52796F', marginBottom: 6 }}>
              <span>{currentIndex + 1} of {visibleFields.length}</span>
              <span>{Math.round(((currentIndex + 1) / visibleFields.length) * 100)}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 2,
                  background: schema.theme.primary,
                  width: `${((currentIndex + 1) / visibleFields.length) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {renderField(currentField)}

          <div style={{ display: 'flex', gap: 12 }}>
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="btn btn-secondary"
                style={{ borderColor: schema.theme.primary, color: schema.theme.primary }}
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
              style={{ background: schema.theme.primary }}
              disabled={submitting}
            >
              {submitting ? <span className="spinner" /> : currentIndex === visibleFields.length - 1 ? (schema.settings.submitButtonText || 'Submit') : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Single Page Layout ----------
  return (
    <div
      style={{
        minHeight: '100vh',
        background: schema.theme.background,
        fontFamily: schema.theme.fontFamily,
        padding: '40px 24px',
      }}
    >
      <form onSubmit={handleSubmit} style={{ maxWidth: 640, margin: '0 auto' }}>
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: '40px 36px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: 24,
          }}
        >
          {/* Header */}
          <h1 style={{ fontSize: baseFontSize + 8, fontWeight: 700, color: schema.theme.text, marginBottom: 8 }}>
            {schema.title}
          </h1>
          {schema.description && (
            <p style={{ color: '#52796F', fontSize: baseFontSize - 1, marginBottom: 32, lineHeight: 1.6 }}>
              {schema.description}
            </p>
          )}

          {/* Progress bar */}
          {schema.settings.showProgressBar && visibleFields.length > 0 && (
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

          {/* Fields */}
          {visibleFields.map(renderField)}

          {errors._form && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {errors._form}
            </div>
          )}

          {!readOnly && (
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                background: schema.theme.primary,
                borderRadius: 10,
              }}
              disabled={submitting}
            >
              {submitting ? <span className="spinner" /> : (schema.settings.submitButtonText || 'Submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
