'use client';

import React from 'react';
import { DBForm } from '@/lib/types';
import FormRenderer from '@/components/form/FormRenderer';

interface PublicFormClientProps {
  form: DBForm;
}

export default function PublicFormClient({ form }: PublicFormClientProps) {
  const handleSubmit = async (answers: Record<string, unknown>) => {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_id: form.id,
        answers,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Submission failed');
    }
  };

  return <FormRenderer schema={form.schema} onSubmit={handleSubmit} />;
}
