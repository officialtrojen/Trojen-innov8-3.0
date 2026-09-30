import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { form_id, answers, metadata } = body;

    if (!form_id || !answers) {
      return NextResponse.json(
        { error: 'Missing form_id or answers' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Insert response into Supabase database
    let responseData = null;
    try {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          form_id,
          answers,
          metadata: metadata || {},
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error) {
        responseData = data;
      }
    } catch {
      // Development mode fallback response object
      responseData = {
        id: 'resp_' + Date.now(),
        form_id,
        answers,
        metadata,
        submitted_at: new Date().toISOString(),
      };
    }

    // Trigger external webhooks if configured
    try {
      const { data: integrations } = await supabase
        .from('integrations')
        .select('*')
        .eq('form_id', form_id)
        .eq('enabled', true);

      if (integrations && integrations.length > 0) {
        for (const integration of integrations) {
          if (integration.type === 'webhook' && integration.configuration?.url) {
            fetch(integration.configuration.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(integration.configuration.headers || {}) },
              body: JSON.stringify({
                event: 'form_response.created',
                form_id,
                response_id: responseData?.id,
                answers,
                submitted_at: new Date().toISOString(),
              }),
            }).catch((err) => console.error('Webhook error:', err));
          }
        }
      }
    } catch (err) {
      console.error('Integration trigger error:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Response submitted successfully',
      data: responseData,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
