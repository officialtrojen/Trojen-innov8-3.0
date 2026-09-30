'use client';

import React, { useEffect, useState, useMemo } from 'react';
import PaperCrumple from './PaperCrumple';
import { FormSchema } from '@/lib/types';
import { generateFormPaperSvg } from './FormCrumpleExperience';
import { Trash2, Sparkles, Check } from 'lucide-react';

interface FormCrunchAnimationOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  schema: FormSchema;
  targetCoords?: { x: number; y: number } | null;
}

export default function FormCrunchAnimationOverlay({
  isOpen,
  onComplete,
  schema,
  targetCoords,
}: FormCrunchAnimationOverlayProps) {
  const [phase, setPhase] = useState<'crumpling' | 'dropping' | 'done'>('crumpling');
  const paperImage = useMemo(() => generateFormPaperSvg(schema), [schema]);

  useEffect(() => {
    if (!isOpen) {
      setPhase('crumpling');
      return;
    }

    setPhase('crumpling');

    // Phase 1: Rapid 3D Crumple (0 to 600ms)
    const dropTimer = setTimeout(() => {
      setPhase('dropping');
    }, 650);

    // Phase 2: Dropped into trash can & complete (1050ms)
    const completeTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 1150);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(38, 59, 59, 0.45)',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* 3D Paper Crumpling into ball */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: phase === 'dropping'
            ? 'scale(0.12) translate(120px, 240px)'
            : 'scale(0.92)',
          opacity: phase === 'dropping' ? 0.3 : 1,
          transition: 'transform 0.45s cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity 0.45s ease',
        }}
      >
        <PaperCrumple
          src={paperImage}
          alt="Form Crumple"
          width={320}
          height={400}
          sceneHeight={440}
          crumpleAmount={0.96}
          crumpleDuration={0.4}
          releaseBehavior="stay"
          paperColor="#FFFEF9"
          lightIntensity={2.0}
          draggable={false}
        />
      </div>

      {/* Floating Status Notification Pill */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          padding: '12px 24px',
          borderRadius: 999,
          background: '#FFFEF9',
          border: '2px solid #4F7C7A',
          boxShadow: '0 8px 32px rgba(38, 59, 59, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#263B3B',
          fontSize: 14,
          fontWeight: 700,
          animation: 'slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#CFE5E3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4F7C7A',
          }}
        >
          {phase === 'done' ? <Check size={16} /> : <Trash2 size={16} />}
        </div>
        <span>
          {phase === 'done'
            ? '✨ Form Discarded! Creating fresh new form...'
            : '🗑️ Paper Crumpling & Dropping into Trash...'}
        </span>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
