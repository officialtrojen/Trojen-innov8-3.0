import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { checkRateLimit, getClientIp, logSecurityEvent } from '@/lib/security';

export async function GET(request: Request) {
  const clientIp = getClientIp(request);

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // OWASP A01: Broken Access Control - Scope forms strictly to authenticated owner
    if (!user) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', { endpoint: '/api/forms', method: 'GET' }, clientIp);
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access your forms.' },
        { status: 401 }
      );
    }

    const { data: forms, error } = await supabase
      .from('forms')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: true, forms: [] });
    }

    return NextResponse.json({ success: true, forms });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Failed to retrieve forms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  // OWASP A04: Rate limit form creations (max 20 per minute per IP)
  const rateLimit = checkRateLimit(`create_form_${clientIp}`, 20, 60);
  if (!rateLimit.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { endpoint: '/api/forms', method: 'POST' }, clientIp);
    return NextResponse.json(
      { error: `Too many requests. Please wait ${rateLimit.resetSeconds}s before creating another form.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { title, description, schema, theme } = body;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // OWASP A01: Require authenticated user to prevent arbitrary unauthenticated form injection
    if (!user) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', { endpoint: '/api/forms', method: 'POST' }, clientIp);
      return NextResponse.json(
        { error: 'Authentication required to create and save forms.' },
        { status: 401 }
      );
    }

    const safeTitle = typeof title === 'string' ? title.slice(0, 150).trim() : 'Untitled Form';
    const safeDesc = typeof description === 'string' ? description.slice(0, 1000).trim() : '';

    const newForm = {
      owner_id: user.id,
      title: safeTitle,
      description: safeDesc,
      schema: schema || { title: safeTitle, description: safeDesc, fields: [], logic: [], theme: {}, settings: {} },
      theme: theme || {},
      status: 'draft',
      public_slug: nanoid(10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('forms').insert(newForm).select().single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create form in database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, form: data }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Failed to process form creation' }, { status: 500 });
  }
}
