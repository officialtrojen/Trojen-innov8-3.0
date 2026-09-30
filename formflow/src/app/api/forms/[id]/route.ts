import { NextResponse } from 'next/server';
import { getFormById, saveForm, deleteForm } from '@/lib/storage';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Try Supabase first
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.from('forms').select('*').eq('id', id).single();
      if (!error && data) {
        return NextResponse.json(data);
      }
    } catch (dbErr) {
      console.warn('Supabase fetch form failed, falling back to local storage:', dbErr);
    }

    // 2. Fallback to local file storage
    const form = await getFormById(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    return NextResponse.json(form);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await getFormById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const updated = await saveForm({
      ...existing,
      ...body,
      id, // Preserve id
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteForm(id);
    if (!success) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
}
