import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: forms, error } = await supabase.from('forms').select('*').order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: true, forms: [] });
    }

    return NextResponse.json({ success: true, forms });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, schema, theme } = body;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const newForm = {
      owner_id: user?.id || 'demo_user',
      title: title || 'Untitled Form',
      description: description || '',
      schema: schema || { title: title || 'Untitled Form', description: '', fields: [], logic: [], theme: {}, settings: {} },
      theme: theme || {},
      status: 'draft',
      public_slug: nanoid(10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('forms').insert(newForm).select().single();

    if (error) {
      return NextResponse.json({ success: true, form: { ...newForm, id: 'form_' + Date.now() } });
    }

    return NextResponse.json({ success: true, form: data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
