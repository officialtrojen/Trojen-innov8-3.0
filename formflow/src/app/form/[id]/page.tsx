import React from 'react';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DBForm } from '@/lib/types';
import { RespondentForm } from '@/components/respondent/RespondentForm';
import { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (!form) {
    return { title: 'Form Not Found' };
  }
  const dbForm = form as DBForm;
  return {
    title: `${dbForm.title} | FlowForm Survey`,
    description: dbForm.description || 'Fill out this workflow form powered by FlowForm.',
  };
}

export default async function FormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (!form) {
    notFound();
  }

  return <RespondentForm form={(form as DBForm).schema} />;
}
