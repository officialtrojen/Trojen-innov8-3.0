'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DBForm, FormSchema } from '@/lib/types';
import FormBuilder from '@/components/builder/FormBuilder';

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const formId = params.id as string;

  const [form, setForm] = useState<DBForm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !formId) return;

    async function loadForm() {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('owner_id', user!.id)
        .single();

      if (error || !data) {
        router.push('/dashboard');
        return;
      }

      setForm(data as DBForm);
      setLoading(false);
    }

    loadForm();
  }, [formId, user, supabase, router]);

  const handleSave = async (schema: FormSchema) => {
    if (!form) return;

    await supabase
      .from('forms')
      .update({
        title: schema.title,
        description: schema.description,
        schema,
        theme: schema.theme,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id);

    setForm((prev) => prev ? { ...prev, schema, title: schema.title, description: schema.description, theme: schema.theme } : null);
  };

  const handlePublish = async () => {
    if (!form) return;

    const newStatus = form.status === 'published' ? 'draft' : 'published';
    await supabase
      .from('forms')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id);

    setForm((prev) => prev ? { ...prev, status: newStatus } : null);
  };

  if (loading || !form) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
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
