'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  FormField,
  FormSchema,
  DEFAULT_THEME,
  DEFAULT_SETTINGS,
} from '@/lib/types';
import { getVisibleFields } from '@/lib/logic-engine';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { getBackgroundStyle } from '@/lib/theme-presets';

// ---------- 1. Hardcoded JSON of 5 Questions (Prompt 1) ----------
export const HARDCODED_TYPEFORM_QUESTIONS: FormField[] = [
  {
    id: 'block_welcome',
    type: 'welcome_screen',
    label: 'Welcome to FormFlow',
    description: 'Experience the sleekest conversational form taking interface built with Next.js, Tailwind & Framer Motion.',
    required: false,
    buttonText: 'Start Quiz',
  },
  {
    id: 'block_name',
    type: 'short_text',
    label: 'What is your full name?',
    description: 'Please introduce yourself so we know who you are.',
    placeholder: 'Type your name here...',
    required: true,
  },
  {
    id: 'block_role',
    type: 'multiple_choice',
    label: 'What best describes your primary expertise?',
    description: 'Press the letter key on your keyboard or click an option.',
    required: true,
    options: ['Frontend Developer', 'Fullstack Engineer', 'UI/UX Designer', 'Product Manager'],
    selectionMode: 'single',
  },
  {
    id: 'block_experience',
    type: 'yes_no',
    label: 'Have you used Typeform before?',
    description: 'Press Y for Yes or N for No.',
    required: true,
  },
  {
    id: 'block_rating',
    type: 'rating',
    label: 'How excited are you to build forms with FormFlow?',
    description: 'Press 1 to 5 on your keyboard to rate.',
    required: true,
    maxStars: 5,
  },
];

export const DEMO_TYPEFORM_SCHEMA: FormSchema = {
  title: 'Interactive Typeform Experience',
  description: 'A 5-question animated quiz demo',
  fields: HARDCODED_TYPEFORM_QUESTIONS,
  logic: [],
  theme: {
    ...DEFAULT_THEME,
    background: '#0F172A',
    backgroundType: 'gradient',
    backgroundGradient: 'linear-gradient(135deg, #090D16 0%, #0F172A 50%, #1E293B 100%)',
    primary: '#38BDF8',
    secondary: '#1E293B',
    text: '#F8FAFC',
    layout: 'conversational',
  },
  settings: DEFAULT_SETTINGS,
};

interface TypeformRendererProps {
  schema?: FormSchema;
  fields?: FormField[];
  onSubmit?: (answers: Record<string, unknown>) => Promise<void> | void;
}

export default function TypeformRenderer({
  schema = DEMO_TYPEFORM_SCHEMA,
  fields: propFields,
  onSubmit,
}: TypeformRendererProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const rawFields = propFields || schema.fields || HARDCODED_TYPEFORM_QUESTIONS;
  const visibleFields = getVisibleFields(rawFields, schema.logic || [], answers as Record<string, any>);
  const activeFields = visibleFields.length > 0 ? visibleFields : rawFields;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeIndex = Math.min(currentIndex, activeFields.length - 1);
  const currentField = activeFields[safeIndex >= 0 ? safeIndex : 0];
  const isLastQuestion = (safeIndex >= 0 ? safeIndex : 0) === activeFields.length - 1;

  // Auto focus input on slide change
  useEffect(() => {
    if (currentField?.type === 'short_text' || currentField?.type === 'paragraph') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentField?.type]);

  // Advance to next question
  const handleNext = useCallback(() => {
    if (!currentField) return;

    // Validate if required
    if (currentField.required && currentField.type !== 'welcome_screen') {
      const val = answers[currentField.id];
      if (val === undefined || val === null || val === '') {
        setError('Please answer this question before proceeding.');
        return;
      }
    }
    setError(null);

    if (isLastQuestion) {
      setIsCompleted(true);
      if (onSubmit) {
        onSubmit(answers);
      }
      return;
    }

    setDirection('forward');
    setCurrentIndex((prev) => Math.min(prev + 1, activeFields.length - 1));
  }, [currentField, answers, isLastQuestion, activeFields.length, onSubmit]);

  // Go back to previous question
  const handlePrev = useCallback(() => {
    setError(null);
    if (currentIndex > 0) {
      setDirection('backward');
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Update answer helper
  const setAnswer = useCallback((fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setError(null);
  }, []);

  // Global Keyboard Navigation (Enter, A/B/C/D, Y/N, 1-5)
  useEffect(() => {
    if (isCompleted || !currentField) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger letter shortcuts if user is typing inside text input
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // 1. Enter key -> submit & advance
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNext();
        return;
      }

      // 2. Navigation up / down arrows
      if (e.key === 'ArrowDown' && !isInputFocused) {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === 'ArrowUp' && !isInputFocused) {
        e.preventDefault();
        handlePrev();
        return;
      }

      // 3. Multiple Choice shortcuts (A, B, C, D...)
      if (currentField.type === 'multiple_choice' && currentField.options && !isInputFocused) {
        const key = e.key.toUpperCase();
        const letterIndex = key.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1, ...
        if (letterIndex >= 0 && letterIndex < currentField.options.length) {
          e.preventDefault();
          const selectedOption = currentField.options[letterIndex];
          setAnswer(currentField.id, selectedOption);
          // Auto advance after selection
          setTimeout(() => {
            handleNext();
          }, 240);
          return;
        }
      }

      // 4. Yes / No shortcuts (Y / N)
      if (currentField.type === 'yes_no' && !isInputFocused) {
        const key = e.key.toUpperCase();
        if (key === 'Y') {
          e.preventDefault();
          setAnswer(currentField.id, 'Yes');
          setTimeout(() => handleNext(), 240);
        } else if (key === 'N') {
          e.preventDefault();
          setAnswer(currentField.id, 'No');
          setTimeout(() => handleNext(), 240);
        }
        return;
      }

      // 5. Rating 1-5 shortcuts
      if (currentField.type === 'rating' && !isInputFocused) {
        const rating = parseInt(e.key, 10);
        const max = currentField.maxStars || 5;
        if (!isNaN(rating) && rating >= 1 && rating <= max) {
          e.preventDefault();
          setAnswer(currentField.id, rating);
          setTimeout(() => handleNext(), 240);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentField, isCompleted, handleNext, handlePrev, setAnswer]);

  // Framer Motion Slide Variants (Slide up & fade out when forward, slide down when backward)
  const variants: Variants = {
    enter: (dir: 'forward' | 'backward') => ({
      y: dir === 'forward' ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: 'spring' as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: 'forward' | 'backward') => ({
      y: dir === 'forward' ? -60 : 60,
      opacity: 0,
      scale: 0.98,
      transition: {
        y: { type: 'spring' as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  // Progress Calculation (0 to 100%)
  const progressPercent = activeFields.length > 0
    ? Math.round(((currentIndex + (isCompleted ? 1 : 0)) / activeFields.length) * 100)
    : 0;

  const primaryColor = schema.theme.primary || '#38BDF8';
  const textColor = schema.theme.text || '#F8FAFC';

  // Completion Screen
  if (isCompleted) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: schema.theme.fontFamily || 'Inter, sans-serif',
          padding: 24,
          textAlign: 'center',
          ...getBackgroundStyle(schema.theme),
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            maxWidth: 520,
            background: 'rgba(30, 41, 59, 0.75)',
            backdropFilter: 'blur(16px)',
            borderRadius: 24,
            padding: '48px 36px',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            color: textColor,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.2)',
              color: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Check size={36} strokeWidth={3} />
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Response Submitted!
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            {schema.settings?.successMessage || 'Thank you! Your response has been recorded successfully.'}
          </p>

          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setCurrentIndex(0);
              setIsCompleted(false);
            }}
            className="btn"
            style={{
              background: primaryColor,
              color: '#0F172A',
              fontWeight: 700,
              fontSize: 14,
              padding: '12px 24px',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={16} /> Take Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: schema.theme.fontFamily || 'Inter, sans-serif',
        color: textColor,
        userSelect: 'none',
        ...getBackgroundStyle(schema.theme),
      }}
    >
      {/* Top Brand / Question Counter */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            F
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
            FormFlow
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>
          <span>{currentIndex + 1}</span>
          <span>/</span>
          <span>{activeFields.length}</span>
        </div>
      </header>

      {/* Center Animated Question Container (Only ONE question visible at a time) */}
      <main
        style={{
          width: '100%',
          maxWidth: 680,
          padding: '0 24px',
          zIndex: 10,
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentField.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ width: '100%' }}
          >
            {/* 1. WELCOME SCREEN */}
            {currentField.type === 'welcome_screen' && (
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: primaryColor,
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 20,
                  }}
                >
                  <Sparkles size={14} /> Ready to begin
                </div>

                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
                  {currentField.label}
                </h1>

                {currentField.description && (
                  <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94A3B8', lineHeight: 1.6, marginBottom: 36, maxWidth: 560 }}>
                    {currentField.description}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      background: primaryColor,
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: 16,
                      padding: '14px 28px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 16px rgba(56, 189, 248, 0.35)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                  >
                    {currentField.buttonText || 'Start Quiz'} <ArrowRight size={18} />
                  </button>

                  <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    press <strong style={{ color: '#94A3B8' }}>Enter ↵</strong>
                  </span>
                </div>
              </div>
            )}

            {/* 2. SHORT TEXT QUESTION */}
            {currentField.type === 'short_text' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ color: primaryColor, fontWeight: 700, fontSize: 16 }}>
                    {currentIndex + 1} →
                  </span>
                  <span style={{ fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                    Short Answer
                  </span>
                </div>

                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
                  {currentField.label}
                  {currentField.required && <span style={{ color: '#F43F5E', marginLeft: 4 }}>*</span>}
                </h2>

                {currentField.description && (
                  <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 28 }}>
                    {currentField.description}
                  </p>
                )}

                <div style={{ marginBottom: 24 }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={(answers[currentField.id] as string) || ''}
                    onChange={(e) => setAnswer(currentField.id, e.target.value)}
                    placeholder={currentField.placeholder || 'Type your answer here...'}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `2px solid ${error ? '#F43F5E' : 'rgba(255,255,255,0.2)'}`,
                      fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                      color: textColor,
                      padding: '12px 0',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = error ? '#F43F5E' : 'rgba(255,255,255,0.2)'; }}
                  />
                  {error && (
                    <div style={{ color: '#F43F5E', fontSize: 13, marginTop: 8 }}>{error}</div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      background: primaryColor,
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: 14,
                      padding: '10px 22px',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    OK <Check size={16} />
                  </button>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    press <strong>Enter ↵</strong>
                  </span>
                </div>
              </div>
            )}

            {/* 3. MULTIPLE CHOICE QUESTION (Keys A, B, C, D) */}
            {currentField.type === 'multiple_choice' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ color: primaryColor, fontWeight: 700, fontSize: 16 }}>
                    {currentIndex + 1} →
                  </span>
                  <span style={{ fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                    Select an option
                  </span>
                </div>

                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
                  {currentField.label}
                  {currentField.required && <span style={{ color: '#F43F5E', marginLeft: 4 }}>*</span>}
                </h2>

                {currentField.description && (
                  <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>
                    {currentField.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {currentField.options?.map((opt, i) => {
                    const keyLetter = String.fromCharCode(65 + i); // 'A', 'B', 'C', 'D'
                    const isSelected = answers[currentField.id] === opt;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAnswer(currentField.id, opt);
                          setTimeout(() => handleNext(), 240);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '14px 18px',
                          borderRadius: 12,
                          background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.6)',
                          border: `1.5px solid ${isSelected ? primaryColor : 'rgba(255,255,255,0.12)'}`,
                          color: textColor,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 15,
                          fontWeight: 500,
                          transition: 'all 0.15s ease',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        {/* Key Badge [A] */}
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            background: isSelected ? primaryColor : 'rgba(255,255,255,0.1)',
                            color: isSelected ? '#0F172A' : '#94A3B8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {keyLetter}
                        </div>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isSelected && <Check size={18} color={primaryColor} />}
                      </button>
                    );
                  })}
                </div>

                {error && <div style={{ color: '#F43F5E', fontSize: 13, marginBottom: 16 }}>{error}</div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      background: primaryColor,
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: 14,
                      padding: '10px 22px',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    OK <Check size={16} style={{ display: 'inline' }} />
                  </button>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    or select with <strong>[A, B, C]</strong>
                  </span>
                </div>
              </div>
            )}

            {/* 4. YES / NO QUESTION (Keys Y / N) */}
            {currentField.type === 'yes_no' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ color: primaryColor, fontWeight: 700, fontSize: 16 }}>
                    {currentIndex + 1} →
                  </span>
                  <span style={{ fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                    Yes / No Choice
                  </span>
                </div>

                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
                  {currentField.label}
                  {currentField.required && <span style={{ color: '#F43F5E', marginLeft: 4 }}>*</span>}
                </h2>

                {currentField.description && (
                  <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 28 }}>
                    {currentField.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                  {[
                    { label: 'Yes', key: 'Y' },
                    { label: 'No', key: 'N' },
                  ].map((choice) => {
                    const isSelected = answers[currentField.id] === choice.label;
                    return (
                      <button
                        key={choice.key}
                        type="button"
                        onClick={() => {
                          setAnswer(currentField.id, choice.label);
                          setTimeout(() => handleNext(), 240);
                        }}
                        style={{
                          flex: 1,
                          padding: '20px 24px',
                          borderRadius: 16,
                          background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                          border: `2px solid ${isSelected ? primaryColor : 'rgba(255,255,255,0.12)'}`,
                          color: textColor,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: 700,
                          fontSize: 18,
                          backdropFilter: 'blur(8px)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{choice.label}</span>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: isSelected ? primaryColor : 'rgba(255,255,255,0.1)',
                            color: isSelected ? '#0F172A' : '#94A3B8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          {choice.key}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {error && <div style={{ color: '#F43F5E', fontSize: 13, marginBottom: 16 }}>{error}</div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      background: primaryColor,
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: 14,
                      padding: '10px 22px',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    OK <Check size={16} style={{ display: 'inline' }} />
                  </button>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    press <strong>[Y]</strong> or <strong>[N]</strong>
                  </span>
                </div>
              </div>
            )}

            {/* 5. RATING 1-5 QUESTION (Keys 1-5) */}
            {currentField.type === 'rating' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ color: primaryColor, fontWeight: 700, fontSize: 16 }}>
                    {currentIndex + 1} →
                  </span>
                  <span style={{ fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                    Rating Scale
                  </span>
                </div>

                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
                  {currentField.label}
                  {currentField.required && <span style={{ color: '#F43F5E', marginLeft: 4 }}>*</span>}
                </h2>

                {currentField.description && (
                  <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 28 }}>
                    {currentField.description}
                  </p>
                )}

                {/* Direct Tap-to-Rate 5 Stars */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((score) => {
                      const currentScore = (answers[currentField.id] as number) || 0;
                      const isFilled = score <= currentScore;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => {
                            setAnswer(currentField.id, score);
                            setTimeout(() => handleNext(), 300);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            borderRadius: 12,
                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.transform = 'scale(1.22)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                          }}
                          title={`Rate ${score} of 5 stars`}
                        >
                          <Star
                            size={44}
                            style={{
                              color: isFilled ? '#F59E0B' : 'rgba(184, 206, 207, 0.55)',
                              fill: isFilled ? '#F59E0B' : 'transparent',
                              filter: isFilled ? 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.45))' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Feedback Text */}
                  <div style={{ fontSize: 13, fontWeight: 600, color: (answers[currentField.id] as number) ? '#F59E0B' : 'rgba(184, 206, 207, 0.7)' }}>
                    {(answers[currentField.id] as number)
                      ? `⭐ ${(answers[currentField.id] as number)} of 5 stars selected`
                      : 'Tap on a star to rate (1 to 5)'}
                  </div>
                </div>

                {error && <div style={{ color: '#F43F5E', fontSize: 13, marginBottom: 16 }}>{error}</div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      background: primaryColor,
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: 14,
                      padding: '10px 22px',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Submit <Check size={16} style={{ display: 'inline' }} />
                  </button>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    or press <strong>[1-5]</strong>
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Floating Navigation Arrows & Shortcut Help */}
      <footer
        style={{
          position: 'absolute',
          bottom: 24,
          right: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 4, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(8px)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{
              padding: 6,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              color: currentIndex === 0 ? '#475569' : textColor,
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            }}
            title="Previous (Arrow Up)"
          >
            <ChevronUp size={20} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: 6,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              color: textColor,
              cursor: 'pointer',
            }}
            title="Next (Arrow Down or Enter)"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </footer>

      {/* 5. Progress Bar at the VERY BOTTOM of screen (Prompt 1 requirement) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 30,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ ease: 'easeOut', duration: 0.35 }}
          style={{
            height: '100%',
            background: primaryColor,
            boxShadow: `0 0 8px ${primaryColor}`,
          }}
        />
      </div>
    </div>
  );
}
