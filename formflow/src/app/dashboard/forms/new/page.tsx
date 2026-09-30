'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DEFAULT_THEME, DEFAULT_SETTINGS, FormSchema } from '@/lib/types';
import { generateSlug } from '@/lib/utils';

export default function NewFormPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setCreating(true);

    const schema: FormSchema = {
      title: title.trim(),
      description: description.trim(),
      fields: [],
      logic: [],
      theme: DEFAULT_THEME,
      settings: DEFAULT_SETTINGS,
    };

    const { data, error } = await supabase
      .from('forms')
      .insert({
        owner_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        schema,
        theme: DEFAULT_THEME,
        status: 'draft',
        public_slug: generateSlug(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating form:', error);
      setCreating(false);
      return;
    }

    router.push(`/dashboard/forms/${data.id}/edit`);
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 40 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F8FAFC', marginBottom: 4, letterSpacing: '-0.02em' }}>Create a New Form</h1>
      <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 32 }}>Give your form a name and start building.</p>

      <form onSubmit={handleCreate}>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label className="label" htmlFor="form-title">Form Title</label>
            <input
              id="form-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hackathon Registration"
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="label" htmlFor="form-desc">Description (optional)</label>
            <textarea
              id="form-desc"
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this form..."
              rows={3}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={creating || !title.trim()}>
            {creating ? <span className="spinner" /> : 'Create Form & Open Builder'}
          </button>
        </div>
      </form>
    </div>
  );
}
