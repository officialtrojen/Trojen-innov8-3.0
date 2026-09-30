'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FormalAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  primaryActionText?: string;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export default function FormalAlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'warning',
  primaryActionText = 'Understood',
  secondaryActionText,
  onSecondaryAction,
}: FormalAlertModalProps) {
  if (!isOpen) return null;

  const isError = type === 'error' || type === 'warning';
  const accentColor = isError ? '#EF4444' : type === 'success' ? '#10B981' : '#38BDF8';
  const accentBg = isError
    ? 'rgba(239, 68, 68, 0.12)'
    : type === 'success'
    ? 'rgba(16, 185, 129, 0.12)'
    : 'rgba(56, 189, 248, 0.12)';
  const accentBorder = isError
    ? 'rgba(239, 68, 68, 0.3)'
    : type === 'success'
    ? 'rgba(16, 185, 129, 0.3)'
    : 'rgba(56, 189, 248, 0.3)';

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: 'rgba(2, 3, 6, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 440,
            background: '#0B0F19',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 18,
            padding: '28px 28px 24px',
            boxShadow: `0 24px 60px rgba(0, 0, 0, 0.85), 0 0 45px ${accentBg}`,
            overflow: 'hidden',
          }}
        >
          {/* Subtle Top Accent Glow Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: 2,
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }}
          />

          {/* Close X Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94A3B8';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <X size={16} />
          </button>

          {/* Icon Badge */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: accentBg,
              border: `1.5px solid ${accentBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
              color: accentColor,
            }}
          >
            {type === 'warning' ? (
              <AlertTriangle size={24} />
            ) : type === 'error' ? (
              <AlertCircle size={24} />
            ) : type === 'success' ? (
              <CheckCircle2 size={24} />
            ) : (
              <Info size={24} />
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#F8FAFC',
              marginBottom: 8,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h3>

          {/* Message */}
          <p
            style={{
              fontSize: 13.5,
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {message}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            {secondaryActionText && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSecondaryAction) onSecondaryAction();
                }}
                className="btn btn-ghost"
                style={{
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#94A3B8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                {secondaryActionText}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 22px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                background: '#FFFFFF',
                color: '#000000',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 10px rgba(255, 255, 255, 0.2)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {primaryActionText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
