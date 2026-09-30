'use client';

import React, { useState, useEffect } from 'react';
import { FormSchema, FormField } from '@/types/form';
import { evaluateFormLogic } from '@/lib/logicEngine';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Star, 
  UploadCloud, 
  Calendar, 
  Sparkles, 
  AlertCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

interface RespondentFormProps {
  form: FormSchema;
}

export const RespondentForm: React.FC<RespondentFormProps> = ({ form }) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const { theme, fields, logicRules } = form;
  const isConversational = theme.layoutMode === 'conversational';

  // Evaluate visible fields dynamically based on answers
  const currentFieldId = fields[currentFieldIndex]?.id;
  const { visibleFieldIds, jumpTargetId } = evaluateFormLogic(
    fields,
    logicRules || [],
    answers,
    currentFieldId
  );

  const activeFields = fields.filter((f) => visibleFieldIds.has(f.id));
  const activeCurrentField = activeFields[currentFieldIndex] || activeFields[0];

  const handleAnswerChange = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    setErrorMsg(null);
  };

  const validateField = (field: FormField): boolean => {
    const val = answers[field.id];
    if (field.required) {
      if (val === undefined || val === null || val === '') {
        setErrorMsg('This field is required to proceed.');
        return false;
      }
    }
    if (field.validation?.minLength && typeof val === 'string' && val.length < field.validation.minLength) {
      setErrorMsg(`Must be at least ${field.validation.minLength} characters.`);
      return false;
    }
    if (field.validation?.maxLength && typeof val === 'string' && val.length > field.validation.maxLength) {
      setErrorMsg(`Maximum length is ${field.validation.maxLength} characters.`);
      return false;
    }
    return true;
  };

  const handleNextCard = () => {
    if (!activeCurrentField) return;
    if (!validateField(activeCurrentField)) return;

    // Check if there is a jump rule for this field
    const evalRes = evaluateFormLogic(fields, logicRules || [], answers, activeCurrentField.id);
    if (evalRes.jumpTargetId) {
      const targetIdx = activeFields.findIndex((f) => f.id === evalRes.jumpTargetId);
      if (targetIdx !== -1) {
        setCurrentFieldIndex(targetIdx);
        return;
      }
    }

    if (currentFieldIndex < activeFields.length - 1) {
      setCurrentFieldIndex((prev) => prev + 1);
    } else {
      handleSubmitForm();
    }
  };

  const handlePrevCard = () => {
    setErrorMsg(null);
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex((prev) => prev - 1);
    }
  };

  const handleSubmitForm = async () => {
    // Validate all active visible fields
    for (const field of activeFields) {
      if (!validateField(field)) {
        if (isConversational) {
          const idx = activeFields.findIndex((f) => f.id === field.id);
          setCurrentFieldIndex(idx);
        }
        return;
      }
    }

    setSubmitting(true);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    try {
      const res = await fetch(`/api/forms/${form.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          respondentMeta: {
            device: isMobile ? 'mobile' : 'desktop',
            durationSeconds,
            userAgent: navigator.userAgent,
          },
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        // Confetti explosion!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
      } else {
        setErrorMsg('Submission failed. Please try again.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcut listener for conversational mode
  useEffect(() => {
    if (!isConversational || submitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // If inside textarea, let user make a new line
        if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConversational, currentFieldIndex, answers, submitted, activeFields]);

  // Render input for a single field
  const renderFieldInput = (field: FormField) => {
    const val = answers[field.id] ?? '';

    switch (field.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={val}
            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'Type your response here...'}
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3.5 text-base sm:text-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all backdrop-blur-sm"
            autoFocus={isConversational}
          />
        );

      case 'paragraph':
        return (
          <textarea
            rows={4}
            value={val}
            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'Type detailed response here...'}
            className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all backdrop-blur-sm resize-none"
            autoFocus={isConversational}
          />
        );

      case 'multiple_choice':
        return (
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
            {(field.options || []).map((opt, i) => {
              const isSelected = val === opt;
              const letter = String.fromCharCode(65 + i);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    handleAnswerChange(field.id, opt);
                    if (isConversational) {
                      setTimeout(handleNextCard, 200);
                    }
                  }}
                  className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer backdrop-blur-sm ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-500/20 text-white ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-500/10'
                      : 'border-white/10 bg-black/25 text-zinc-300 hover:border-white/30 hover:bg-black/40'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold border transition-colors ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500 text-white'
                        : 'border-white/20 bg-white/5 text-zinc-400'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-medium">{opt}</span>
                  {isSelected && <Check className="w-4 h-4 ml-auto text-indigo-400" />}
                </button>
              );
            })}
          </div>
        );

      case 'rating':
        const maxStars = field.maxRating || 5;
        const currentRating = Number(val) || 0;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {Array.from({ length: maxStars }).map((_, i) => {
                const starVal = i + 1;
                const isFilled = starVal <= currentRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => {
                      handleAnswerChange(field.id, starVal);
                      if (isConversational) {
                        setTimeout(handleNextCard, 250);
                      }
                    }}
                    className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isFilled
                        ? 'border-amber-400/80 bg-amber-400/15 text-amber-300 shadow-md shadow-amber-400/10'
                        : 'border-white/10 bg-black/25 text-zinc-500 hover:border-white/25 hover:text-zinc-300'
                    }`}
                  >
                    <Star
                      className={`w-6 h-6 sm:w-8 sm:h-8 transition-transform hover:scale-110 ${
                        isFilled ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'
                      }`}
                    />
                    <span className="text-xs font-mono">{starVal}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-zinc-400">
              {currentRating > 0 ? `Selected: ${currentRating} of ${maxStars} stars` : 'Click to rate'}
            </div>
          </div>
        );

      case 'file_upload':
        return (
          <div className="p-6 rounded-2xl border-2 border-dashed border-white/20 bg-black/25 hover:bg-black/40 text-center transition-all cursor-pointer">
            <input
              type="file"
              id={`file_${field.id}`}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedFiles((prev) => ({ ...prev, [field.id]: file.name }));
                  handleAnswerChange(field.id, file.name);
                }
              }}
            />
            <label htmlFor={`file_${field.id}`} className="cursor-pointer block space-y-2">
              <UploadCloud className="w-8 h-8 mx-auto text-indigo-400" />
              <div className="text-sm font-semibold text-white">
                {uploadedFiles[field.id] ? (
                  <span className="text-emerald-400">✓ {uploadedFiles[field.id]}</span>
                ) : (
                  'Click to select file'
                )}
              </div>
              <div className="text-xs text-zinc-400">
                PDF, PNG, JPG, or ZIP up to 25MB
              </div>
            </label>
          </div>
        );

      case 'date':
        return (
          <div className="relative max-w-sm">
            <input
              type="date"
              value={val}
              onChange={(e) => handleAnswerChange(field.id, e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all backdrop-blur-sm"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Completion Screen
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 text-center select-none"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
        }}
      >
        <div
          className="max-w-md w-full p-8 rounded-3xl border shadow-2xl space-y-5 animate-in zoom-in-95 fade-in duration-300 backdrop-blur-md"
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: `${theme.primaryColor}44`,
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white">Submission Received!</h2>
          <p className="text-sm text-zinc-400">
            Thank you for completing <strong className="text-white">{form.title}</strong>. Your answers have been recorded and synced to our workflow.
          </p>

          <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
                setCurrentFieldIndex(0);
              }}
              className="px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversational Card Mode (Typeform style)
  if (isConversational) {
    const progressPercent = activeFields.length > 0
      ? Math.round(((currentFieldIndex + 1) / activeFields.length) * 100)
      : 0;

    return (
      <div
        className="min-h-screen flex flex-col justify-between p-4 sm:p-8"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
        }}
      >
        {/* Top Progress Header */}
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 mb-4 sm:mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: theme.primaryColor,
              }}
            />
          </div>
          <span className="text-xs font-mono font-medium text-zinc-400">
            {currentFieldIndex + 1} of {activeFields.length}
          </span>
        </div>

        {/* Center Question Card */}
        <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center my-6">
          {activeCurrentField && (
            <div
              key={activeCurrentField.id}
              className="p-6 sm:p-10 rounded-3xl border shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{
                backgroundColor: theme.cardBackground,
                borderColor: `${theme.primaryColor}33`,
              }}
            >
              {/* Question metadata */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-mono font-bold uppercase tracking-wider"
                  style={{ color: theme.accentColor }}
                >
                  Question {currentFieldIndex + 1}
                </span>
                {activeCurrentField.required && (
                  <span className="text-rose-400 text-xs font-medium">* Required</span>
                )}
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                {activeCurrentField.label}
              </h2>

              {activeCurrentField.description && (
                <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
                  {activeCurrentField.description}
                </p>
              )}

              {/* Form Control */}
              <div className="mt-4 mb-6">{renderFieldInput(activeCurrentField)}</div>

              {/* Error message */}
              {errorMsg && (
                <div className="mb-4 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {currentFieldIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevCard}
                      className="p-2.5 rounded-xl border border-white/20 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Previous Question"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <span className="hidden sm:inline-block text-[11px] text-zinc-500 font-mono">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">Enter ↵</kbd>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextCard}
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {currentFieldIndex === activeFields.length - 1 ? (
                    submitting ? 'Submitting...' : 'Submit Form ✓'
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between text-[11px] text-zinc-500 pt-4">
          <span>{form.title}</span>
          <span>Powered by FlowForm No-Code Engine</span>
        </div>
      </div>
    );
  }

  // Single-Page Form Mode
  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Banner if exists */}
        {theme.bannerImage && (
          <div className="h-44 sm:h-56 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
            <img src={theme.bannerImage} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        )}

        {/* Title Header Card */}
        <div
          className="p-6 sm:p-8 rounded-3xl border shadow-xl backdrop-blur-md"
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: `${theme.primaryColor}33`,
          }}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{form.description}</p>
          )}
        </div>

        {/* All Active Visible Fields */}
        <div className="space-y-4">
          {activeFields.map((field, idx) => (
            <div
              key={field.id}
              className="p-6 rounded-2xl border shadow-lg backdrop-blur-md"
              style={{
                backgroundColor: theme.cardBackground,
                borderColor: `${theme.primaryColor}22`,
              }}
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xs font-mono font-bold" style={{ color: theme.accentColor }}>
                  {idx + 1}.
                </span>
                <h3 className="text-base font-bold text-white">
                  {field.label}
                  {field.required && <span className="text-rose-400 ml-1">*</span>}
                </h3>
              </div>

              {field.description && (
                <p className="text-xs text-zinc-400 mb-4">{field.description}</p>
              )}

              <div className="mt-2">{renderFieldInput(field)}</div>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSubmitForm}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {submitting ? 'Submitting...' : 'Complete & Submit Form ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};
