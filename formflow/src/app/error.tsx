'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error caught:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070C1A',
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 500,
          width: '100%',
          padding: 36,
          background: '#1E293B',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <AlertCircle size={28} color="#F87171" />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24, lineHeight: 1.5 }}>
          {error?.message || 'An unexpected error occurred while loading this page.'}
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
            <RefreshCw size={16} /> Reload Page
          </button>

          <Link
            href="/dashboard"
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
            <Home size={16} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
