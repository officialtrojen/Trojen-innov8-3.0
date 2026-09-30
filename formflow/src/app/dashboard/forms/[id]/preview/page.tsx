'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DBForm } from '@/lib/types';
import FormRenderer from '@/components/form/FormRenderer';
import { Monitor, Tablet, Smartphone, ArrowLeft } from 'lucide-react';

export default function PreviewFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const formId = params.id as string;
  const [form, setForm] = useState<DBForm | null>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !formId) return;

    async function loadForm() {
      const { data } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('owner_id', user!.id)
        .single();

      if (!data) {
        router.push('/dashboard');
        return;
      }
      setForm(data as DBForm);
      setLoading(false);
    }
    loadForm();
  }, [formId, user, supabase, router]);

  if (loading || !form) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  const widthMap = { desktop: '100%', tablet: '768px', mobile: '375px' };

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/dashboard/forms/${formId}/edit`} className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} /> Back to Editor
          </Link>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#263B3B' }}>Preview: {form.title}</h1>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--accent)', borderRadius: 8, padding: 3 }}>
          {([
            { key: 'desktop', icon: Monitor },
            { key: 'tablet', icon: Tablet },
            { key: 'mobile', icon: Smartphone },
          ] as const).map((d) => (
            <button
              key={d.key}
              onClick={() => setDevice(d.key)}
              className="btn btn-sm"
              style={{
                background: device === d.key ? 'white' : 'transparent',
                color: device === d.key ? 'var(--primary)' : '#52796F',
                boxShadow: device === d.key ? 'var(--shadow-sm)' : 'none',
                borderRadius: 6,
                border: 'none',
                padding: '6px 10px',
              }}
            >
              <d.icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Preview container */}
      <div
        style={{
          maxWidth: widthMap[device],
          margin: '0 auto',
          transition: 'max-width 0.3s ease',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(184,206,207,0.3)',
        }}
      >
        <FormRenderer schema={form.schema} readOnly />
      </div>
    </div>
  );
}
