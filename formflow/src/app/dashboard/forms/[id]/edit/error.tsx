'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function EditFormError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Form Editor Error Boundary caught:', error);
  }, [error]);

  return (
    <div
      style={{
        maxWidth: 540,
        margin: '60px auto',
        padding: 36,
        background: '#1E293B',
        border: '1px solid rgba(248, 113, 113, 0.3)',
        borderRadius: 16,
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <AlertCircle size={32} color="#F87171" />
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
        Form Builder Hit a Snag
      </h2>
      <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20, lineHeight: 1.5 }}>
        {error?.message || 'An unexpected issue occurred while rendering the form builder.'}
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            background: '#8B5CF6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} /> Try Again
        </button>

        <Link
          href="/dashboard/forms"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: '#F8FAFC',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Forms
        </Link>
      </div>
    </div>
  );
}
