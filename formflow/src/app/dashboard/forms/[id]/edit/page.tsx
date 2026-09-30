'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  useEffect(() => {
    if (formId) {
      router.replace(`/builder?id=${encodeURIComponent(formId)}`);
    }
  }, [formId, router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', gap: 14 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ fontSize: 14, color: '#94A3B8' }}>Opening Studio Canvas...</span>
    </div>
  );
}
