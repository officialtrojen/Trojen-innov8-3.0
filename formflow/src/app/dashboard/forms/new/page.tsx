'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DEFAULT_THEME, DEFAULT_SETTINGS, FormSchema } from '@/lib/types';
import { generateSlug } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';

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
    <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 20 }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: 6,
          letterSpacing: '-0.5px',
        }}
      >
        Create a New Form
      </h1>
      <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 32 }}>
        Give your form a name and launch the drag-and-drop workflow builder.
      </p>

      <form onSubmit={handleCreate}>
        <div
          className="card"
          style={{
            padding: 36,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <label
              className="label"
              htmlFor="form-title"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}
            >
              Form Title
            </label>
            <input
              id="form-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hackathon Registration Form"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(10, 15, 30, 0.7)',
                color: '#FFFFFF',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label
              className="label"
              htmlFor="form-desc"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}
            >
              Description <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="form-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this form is for..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(10, 15, 30, 0.7)',
                color: '#FFFFFF',
                fontSize: 14,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              fontSize: 14.5,
              fontWeight: 700,
              boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            disabled={creating || !title.trim()}
          >
            {creating ? (
              <span className="spinner" />
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Create Form & Open Builder</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
