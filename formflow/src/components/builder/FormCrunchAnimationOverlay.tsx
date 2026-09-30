'use client';

import React from 'react';
import FormCrumpleExperience from './FormCrumpleExperience';
import { FormSchema } from '@/lib/types';

interface FormCrunchAnimationOverlayProps {
  isOpen: boolean;
  schema: FormSchema;
  onComplete: () => void;
}

export default function FormCrunchAnimationOverlay({
  isOpen,
  schema,
  onComplete,
}: FormCrunchAnimationOverlayProps) {
  if (!isOpen) return null;

  return (
    <FormCrumpleExperience
      isOpen={isOpen}
      schema={schema}
      onClose={onComplete}
      onNewForm={onComplete}
    />
  );
}
