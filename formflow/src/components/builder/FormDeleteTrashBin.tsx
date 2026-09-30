'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FormSchema } from '@/lib/types';
import PaperCrumple from './PaperCrumple';

interface FormDeleteTrashBinProps {
  isFormArmed: boolean;
  onArmToggle: (armed: boolean) => void;
  onCrumpleDelete: () => void;
  schema: FormSchema;
  trashBinRef: React.RefObject<HTMLDivElement | null>;
  isOverTrash: boolean;
  isCrumpling: boolean;
  onTrashClick?: () => void;
}

export default function FormDeleteTrashBin({
  isFormArmed,
  onArmToggle,
  onCrumpleDelete,
  schema,
  trashBinRef,
  isOverTrash,
  isCrumpling,
  onTrashClick,
}: FormDeleteTrashBinProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Trigger pulse when armed
  useEffect(() => {
    if (isFormArmed) {
      setPulseAnimation(true);
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 4500);
      return () => clearTimeout(timer);
    } else {
      setPulseAnimation(false);
      setShowTooltip(false);
    }
  }, [isFormArmed]);

  return (
    <div
      ref={trashBinRef}
      style={{
        position: 'absolute',
        bottom: 24,
        right: 28,
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'auto',
      }}
    >
      {/* Informative Tooltip / Helper Badge */}
      {(showTooltip || isFormArmed || isOverTrash) && (
        <div
          style={{
            marginBottom: 10,
            padding: '7px 14px',
            borderRadius: 10,
            background: isOverTrash ? '#FDEDEC' : '#263B3B',
            color: isOverTrash ? '#C0392B' : '#FFFEF9',
            fontSize: 12,
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(38, 59, 59, 0.25)',
            border: isOverTrash ? '1.5px solid #E74C3C' : '1.5px solid #4F7C7A',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s ease, bounce 1.5s infinite',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transformOrigin: 'bottom right',
          }}
        >
          {isOverTrash ? (
            <span>🔥 Release to Crumple & Delete Form!</span>
          ) : isFormArmed ? (
            <span>👇 Drag form here to crumple into trash</span>
          ) : (
            <span>💡 Click form 2 times to select, then drag here</span>
          )}
        </div>
      )}

      {/* The Delete Trash Icon Button */}
      <div
        onClick={onTrashClick || onCrumpleDelete}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => !isFormArmed && setShowTooltip(false)}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: isOverTrash ? '#FDEDEC' : isFormArmed ? '#FFEEEE' : '#FFFEF9',
          border: `2.5px solid ${isOverTrash ? '#C0392B' : '#E74C3C'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOverTrash
            ? '0 0 26px rgba(231, 76, 60, 0.6), 0 8px 24px rgba(231, 76, 60, 0.35)'
            : isFormArmed
            ? '0 0 22px rgba(231, 76, 60, 0.45), 0 6px 20px rgba(38, 59, 59, 0.2)'
            : '0 4px 16px rgba(231, 76, 60, 0.25), 0 2px 8px rgba(38, 59, 59, 0.1)',
          transform: isOverTrash ? 'scale(1.2)' : isFormArmed ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
        }}
        title="Delete Icon: Double-click form and drag here to crumple & delete"
      >
        {/* Animated Ripple Beacon Ring when armed */}
        {isFormArmed && (
          <div
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: '2px solid #E74C3C',
              animation: 'ripple 1.5s infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Animated Trash Can SVG with moving lid */}
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#E74C3C"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Animated Lid */}
          <g
            style={{
              transformOrigin: '4px 7px',
              transform: isOverTrash ? 'rotate(-35deg) translateY(-4px)' : 'none',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </g>

          {/* Bin Body */}
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>

        {/* Delete label badge */}
        <span
          style={{
            position: 'absolute',
            bottom: -7,
            padding: '2px 7px',
            borderRadius: 6,
            background: '#E74C3C',
            color: '#FFFEF9',
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 6px rgba(231, 76, 60, 0.4)',
          }}
        >
          Delete
        </span>
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
