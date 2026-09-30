import React from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DBForm } from '@/lib/types';
import PublicFormClient from './PublicFormClient';

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('public_slug', slug)
    .single();

  if (!form) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#EAF4F4',
          fontFamily: 'Inter, sans-serif',
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#263B3B', marginBottom: 12 }}>Form Not Found</h1>
          <p style={{ color: '#52796F', fontSize: 14 }}>This form doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const dbForm = form as DBForm;

  // Check if form is accepting responses
  if (dbForm.status === 'closed' || dbForm.status === 'draft') {
    const message = dbForm.schema?.settings?.closedMessage || 'This form is no longer accepting responses.';
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: dbForm.schema?.theme?.background || '#EAF4F4',
          fontFamily: dbForm.schema?.theme?.fontFamily || 'Inter, sans-serif',
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#263B3B', marginBottom: 12 }}>{dbForm.title}</h1>
          <p style={{ color: '#52796F', fontSize: 14 }}>{message}</p>
        </div>
      </div>
    );
  }

  return <PublicFormClient form={dbForm} />;
}
