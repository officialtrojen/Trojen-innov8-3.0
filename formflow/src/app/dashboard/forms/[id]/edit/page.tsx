'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DBForm, FormSchema, DEFAULT_THEME, DEFAULT_SETTINGS } from '@/lib/types';
import FormBuilder from '@/components/builder/FormBuilder';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const formId = params?.id as string;

  const [form, setForm] = useState<DBForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) return;

    let isMounted = true;

    async function loadForm() {
      const supabase = createClient();
      let foundForm: DBForm | null = null;

      // 1. Try Supabase direct query
      try {
        const { data, error } = await supabase.from('forms').select('*').eq('id', formId).single();
        if (!error && data) {
          foundForm = data as DBForm;
        }
      } catch (dbErr) {
        console.warn('Supabase form query failed, attempting fallbacks:', dbErr);
      }

      // 2. Fallback: Query server API route
      if (!foundForm) {
        try {
          const res = await fetch(`/api/forms/${formId}`);
          if (res.ok) {
            const apiData = await res.json();
            if (apiData && !apiData.error) {
              foundForm = {
                id: apiData.id || formId,
                owner_id: user?.id || apiData.owner_id || 'demo_user',
                title: apiData.title || 'Untitled Form',
                description: apiData.description || '',
                schema: apiData.schema || apiData,
                theme: apiData.theme || apiData.schema?.theme || DEFAULT_THEME,
                status: apiData.status || 'draft',
                public_slug: apiData.public_slug || formId.slice(0, 8),
                created_at: apiData.created_at || new Date().toISOString(),
                updated_at: apiData.updated_at || new Date().toISOString(),
              };
            }
          }
        } catch (apiErr) {
          console.warn('API form fetch failed:', apiErr);
        }
      }

      // 3. Fallback: LocalStorage check
      if (!foundForm && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`formflow_form_${formId}`);
          if (cached) {
            foundForm = JSON.parse(cached);
          }
        } catch {}
      }

      if (!isMounted) return;

      if (!foundForm) {
        setErrorMsg('Form could not be found or you do not have permission to view it.');
        setLoading(false);
        return;
      }

      // Parse and normalize schema so it's guaranteed to be safely structured
      let parsedSchema = foundForm.schema;
      if (typeof parsedSchema === 'string') {
        try {
          parsedSchema = JSON.parse(parsedSchema);
        } catch {}
      }

      const safeSchema: FormSchema = {
        title: foundForm.title || parsedSchema?.title || 'Untitled Form',
        description: foundForm.description || parsedSchema?.description || '',
        fields: Array.isArray(parsedSchema?.fields) ? parsedSchema.fields : [],
        logic: Array.isArray(parsedSchema?.logic) ? parsedSchema.logic : [],
        theme: parsedSchema?.theme || foundForm.theme || DEFAULT_THEME,
        settings: parsedSchema?.settings || DEFAULT_SETTINGS,
      };

      setForm({
        ...foundForm,
        schema: safeSchema,
      });
      setLoading(false);
    }

    loadForm();

    return () => {
      isMounted = false;
    };
  }, [formId, user?.id]);

  const handleSave = async (schema: FormSchema) => {
    if (!form) return;
    const supabase = createClient();

    // Cache locally
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `formflow_form_${form.id}`,
          JSON.stringify({ ...form, schema, title: schema.title, description: schema.description, theme: schema.theme })
        );
      } catch {}
    }

    let savedToDb = false;
    try {
      const { error } = await supabase
        .from('forms')
        .update({
          title: schema.title,
          description: schema.description,
          schema,
          theme: schema.theme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.id);

      if (!error) {
        savedToDb = true;
      } else {
        console.warn('Direct Supabase save returned error:', error);
      }
    } catch (saveErr) {
      console.warn('Direct Supabase save failed:', saveErr);
    }

    if (!savedToDb) {
      try {
        await fetch(`/api/forms/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: schema.title,
            description: schema.description,
            schema,
            theme: schema.theme,
          }),
        });
      } catch (apiErr) {
        console.warn('API save fallback failed:', apiErr);
      }
    }

    setForm((prev) =>
      prev ? { ...prev, schema, title: schema.title, description: schema.description, theme: schema.theme } : null
    );
  };

  const handlePublish = async () => {
    if (!form) return;
    const supabase = createClient();
    const newStatus = form.status === 'published' ? 'draft' : 'published';

    try {
      await supabase
        .from('forms')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.id);
    } catch {}

    try {
      await fetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}

    setForm((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', gap: 12 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <span style={{ fontSize: 13, color: '#94A3B8' }}>Loading Form Builder...</span>
      </div>
    );
  }

  if (errorMsg || !form) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, textAlign: 'center' }}>
        <AlertCircle size={36} color="#F87171" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>Form Not Accessible</h2>
        <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24 }}>{errorMsg || 'Unable to open form in builder.'}</p>
        <Link
          href="/dashboard"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, textDecoration: 'none' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ margin: '-32px -32px 0', height: 'calc(100vh)' }}>
      <FormBuilder
        initialSchema={form.schema}
        formId={form.id}
        formStatus={form.status}
        publicSlug={form.public_slug}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </div>
  );
}
