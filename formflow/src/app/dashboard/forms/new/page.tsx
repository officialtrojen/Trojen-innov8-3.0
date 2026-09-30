'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewFormPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/builder');
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
}
