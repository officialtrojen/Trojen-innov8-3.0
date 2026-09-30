'use client';

import React, { useState, useMemo } from 'react';
import PaperCrumple from './PaperCrumple';
import { FormSchema } from '@/lib/types';
import { Trash2, Sparkles, X, RotateCcw, Plus, Check } from 'lucide-react';

interface FormCrumpleExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  onNewForm: () => void;
  schema: FormSchema;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export function generateFormPaperSvg(schema: FormSchema): string {
  const fields = schema.fields.slice(0, 5);
  const questionsMarkup = fields
    .map((f, i) => {
      const top = 140 + i * 52;
      return `
      <g transform="translate(24, ${top})">
        <rect x="0" y="0" width="272" height="42" rx="8" fill="#F4F8F8" stroke="#B8CECF" stroke-width="1.5" />
        <circle cx="16" cy="21" r="7" fill="#CFE5E3" />
        <text x="13" y="24" font-family="Inter, sans-serif" font-size="9" font-weight="700" fill="#263B3B">${i + 1}</text>
        <text x="32" y="19" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#263B3B">${escapeXml(
          f.label.slice(0, 28)
        )}</text>
        <rect x="32" y="26" width="130" height="7" rx="3.5" fill="#CFE5E3" />
      </g>
    `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4F7C7A" />
        <stop offset="100%" stop-color="#365F5D" />
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFEF9" />
        <stop offset="100%" stop-color="#FBFDFD" />
      </linearGradient>
    </defs>
    <!-- Paper Sheet Card -->
    <rect width="320" height="420" rx="14" fill="url(#cardGrad)" stroke="#B8CECF" stroke-width="2"/>
    
    <!-- Form Header Banner -->
    <rect x="0" y="0" width="320" height="68" rx="14" fill="url(#headerGrad)" />
    <rect x="0" y="54" width="320" height="14" fill="url(#headerGrad)" />
    <text x="24" y="36" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FFFEF9">${escapeXml(
      schema.title.slice(0, 24)
    )}</text>
    <text x="24" y="52" font-family="Inter, sans-serif" font-size="9.5" font-weight="500" fill="#CFE5E3">FormFlow Interactive Document</text>
    
    <!-- Subtitle Bar -->
    <rect x="24" y="86" width="272" height="12" rx="4" fill="#EAF4F4" />
    <rect x="24" y="104" width="170" height="10" rx="4" fill="#EAF4F4" />
    
    <!-- Questions List -->
    ${questionsMarkup}
    
    <!-- Submit Button Representation -->
    <rect x="24" y="372" width="110" height="30" rx="8" fill="#4F7C7A" />
    <text x="52" y="391" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FFFEF9">Submit Form</text>
    <rect x="144" y="372" width="80" height="30" rx="8" fill="#EAF4F4" stroke="#B8CECF" stroke-width="1.5" />
    <text x="168" y="391" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#365F5D">Save Draft</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function FormCrumpleExperience({
  isOpen,
  onClose,
  onNewForm,
  schema,
}: FormCrumpleExperienceProps) {
  const [crumpledCount, setCrumpledCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [trashHovered, setTrashHovered] = useState(false);
  const trashRef = React.useRef<HTMLDivElement>(null);

  const paperImage = useMemo(() => generateFormPaperSvg(schema), [schema]);

  if (!isOpen) return null;

  const handleCrumpleToTrash = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onNewForm();
      setIsDeleting(false);
      onClose();
    }, 900);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(38, 59, 59, 0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          background: '#FFFEF9',
          borderRadius: 20,
          border: '2px solid #B8CECF',
          boxShadow: '0 25px 60px rgba(38, 59, 59, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            background: '#EAF4F4',
            borderBottom: '1px solid #B8CECF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#CFE5E3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4F7C7A',
              }}
            >
              <Trash2 size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#263B3B' }}>
                Crumple & Discard Form
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#365F5D' }}>
                Grab and crumple the 3D form sheet, then drop it in the trash to create a fresh new form
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#365F5D',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3D WebGL Paper Crumple Scene */}
        <div
          style={{
            height: 440,
            position: 'relative',
            background: 'radial-gradient(circle at 50% 50%, #FFFEF9 0%, #EAF4F4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <PaperCrumple
            src={paperImage}
            alt="Current Form Document"
            width={310}
            height={400}
            sceneHeight={440}
            crumpleAmount={0.9}
            crumpleDuration={0.6}
            releaseBehavior="restore"
            creaseStrength={0.25}
            paperColor="#FFFEF9"
            lightIntensity={1.9}
            draggable={true}
            dragRotation={14}
            resetKey={crumpledCount}
            onDragMove={({ clientX, clientY }) => {
              if (trashRef.current) {
                const rect = trashRef.current.getBoundingClientRect();
                const isOver =
                  clientX >= rect.left - 20 &&
                  clientX <= rect.right + 20 &&
                  clientY >= rect.top - 40 &&
                  clientY <= rect.bottom + 20;
                setTrashHovered(isOver);
              }
            }}
            onDragEnd={({ clientX, clientY }) => {
              if (trashRef.current) {
                const rect = trashRef.current.getBoundingClientRect();
                const isOver =
                  clientX >= rect.left - 20 &&
                  clientX <= rect.right + 20 &&
                  clientY >= rect.top - 40 &&
                  clientY <= rect.bottom + 20;
                if (isOver) {
                  handleCrumpleToTrash();
                } else {
                  setTrashHovered(false);
                }
              }
            }}
            onStateChange={(state) => {
              if (state === 'crumpled' || state === 'creased') {
                setTrashHovered(true);
              }
            }}
          />

          {/* Interactive Instruction Pill */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(255, 254, 249, 0.9)',
              border: '1px solid #B8CECF',
              boxShadow: '0 2px 8px rgba(38, 59, 59, 0.1)',
              fontSize: 12,
              fontWeight: 600,
              color: '#4F7C7A',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              pointerEvents: 'none',
            }}
          >
            <Sparkles size={13} color="#4F7C7A" />
            Click & hold paper to crumple • Drag to rotate
          </div>

          {/* Deleting Overlay when confirmed */}
          {isDeleting && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(234, 244, 244, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#CFE5E3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4F7C7A',
                  animation: 'pulse 1s infinite',
                }}
              >
                <Trash2 size={28} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#263B3B' }}>
                Form Discarded! Generating clean editing page...
              </div>
            </div>
          )}
        </div>

        {/* Delete Target Zone & Actions */}
        <div
          style={{
            padding: '18px 24px',
            background: '#FFFEF9',
            borderTop: '1px solid #B8CECF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          {/* Target Trash Icon Box */}
          <div
            ref={trashRef}
            onClick={handleCrumpleToTrash}
            onMouseEnter={() => setTrashHovered(true)}
            onMouseLeave={() => setTrashHovered(false)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              borderRadius: 12,
              border: `2px dashed ${trashHovered ? '#F87171' : '#4F7C7A'}`,
              background: trashHovered ? '#FEF2F2' : '#EAF4F4',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: trashHovered ? '0 0 16px rgba(248, 113, 113, 0.25)' : 'none',
              transform: trashHovered ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: trashHovered ? '#FEE2E2' : '#CFE5E3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: trashHovered ? '#F87171' : '#4F7C7A',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              <Trash2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: trashHovered ? '#DC2626' : '#263B3B' }}>
                Delete Icon Drop Zone
              </div>
              <div style={{ fontSize: 11, color: '#365F5D' }}>
                Click or drop paper here to crush form & open new editing page
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => setCrumpledCount((c) => c + 1)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #B8CECF',
                background: '#FFFEF9',
                color: '#365F5D',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              title="Smooth out paper"
            >
              <RotateCcw size={14} /> Unfold Paper
            </button>

            <button
              type="button"
              onClick={handleCrumpleToTrash}
              style={{
                padding: '11px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#4F7C7A',
                color: '#FFFEF9',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(79, 124, 122, 0.35)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#365F5D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4F7C7A';
              }}
            >
              <Plus size={16} /> Discard & Create New Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
