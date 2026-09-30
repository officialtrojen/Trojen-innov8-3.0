import React from 'react';
import { notFound } from 'next/navigation';
import { getFormById } from '@/lib/storage';
import { RespondentForm } from '@/components/respondent/RespondentForm';
import { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const form = await getFormById(id);
  if (!form) {
    return { title: 'Form Not Found' };
  }
  return {
    title: `${form.title} | FlowForm Survey`,
    description: form.description || 'Fill out this workflow form powered by FlowForm.',
  };
}

export default async function FormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await getFormById(id);

  if (!form) {
    notFound();
  }

  return <RespondentForm form={form} />;
}
