import { NextResponse } from 'next/server';
import { getFormById, saveForm, deleteForm } from '@/lib/storage';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getClientIp, logSecurityEvent } from '@/lib/security';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 });
    }

    // 1. Try Supabase first
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.from('forms').select('*').eq('id', id).single();
      if (!error && data) {
        return NextResponse.json(data);
      }
    } catch {
      // Fall through to local fallback
    }

    // 2. Fallback to local file storage
    const form = await getFormById(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    return NextResponse.json(form);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientIp = getClientIp(request);

  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // OWASP A01: Broken Access Control (IDOR) - Verify user owns the form
    const { data: existingForm, error: fetchErr } = await supabase
      .from('forms')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!user || (existingForm.owner_id && existingForm.owner_id !== user.id)) {
      logSecurityEvent(
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        { endpoint: `/api/forms/${id}`, method: 'PUT', formId: id, attemptedBy: user?.id || 'anonymous' },
        clientIp
      );
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this form.' },
        { status: 403 }
      );
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (body.title !== undefined) updatePayload.title = String(body.title).slice(0, 150).trim();
    if (body.description !== undefined) updatePayload.description = String(body.description).slice(0, 1000).trim();
    if (body.schema !== undefined) updatePayload.schema = body.schema;
    if (body.theme !== undefined) updatePayload.theme = body.theme;
    if (body.status !== undefined) updatePayload.status = body.status;

    const { data, error } = await supabase
      .from('forms')
      .update(updatePayload)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update form in database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updatedInSupabase: true,
      form: data,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientIp = getClientIp(request);

  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // OWASP A01: Broken Access Control (IDOR) - Verify user owns the form before deleting
    const { data: existingForm, error: fetchErr } = await supabase
      .from('forms')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!user || (existingForm.owner_id && existingForm.owner_id !== user.id)) {
      logSecurityEvent(
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        { endpoint: `/api/forms/${id}`, method: 'DELETE', formId: id, attemptedBy: user?.id || 'anonymous' },
        clientIp
      );
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete this form.' },
        { status: 403 }
      );
    }

    const { error: delError } = await supabase
      .from('forms')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id);

    if (delError) {
      return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
    }

    // Also clean up local file if present
    await deleteForm(id).catch(() => {});

    return NextResponse.json({ success: true, message: 'Form deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
}
