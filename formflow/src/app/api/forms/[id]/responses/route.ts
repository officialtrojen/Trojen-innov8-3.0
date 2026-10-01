import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { FormResponse } from '@/types/form';

async function triggerWebhooks(form: any, response: FormResponse) {
  if (!form.webhooks || !Array.isArray(form.webhooks)) return;

  const enabledWebhooks = form.webhooks.filter((w: any) => w.enabled && w.url);
  
  for (const wh of enabledWebhooks) {
    try {
      const isDiscord = wh.url.includes('discord.com/api/webhooks');
      const isSlack = wh.url.includes('hooks.slack.com');

      let payload: any;

      if (isDiscord) {
        const fields = Object.entries(response.answers).map(([key, val]) => {
          const formField = form.fields.find((f: any) => f.id === key);
          const name = formField ? formField.label : key;
          return {
            name: name.slice(0, 256),
            value: String(val ?? 'N/A').slice(0, 1024),
            inline: false,
          };
        });

        payload = {
          username: 'FlowForm Survey Bot',
          avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          embeds: [
            {
              title: `🎉 New Response: ${form.title}`,
              description: `A user has just submitted a new response to **${form.title}**.`,
              color: 0x6366f1, // indigo
              fields: fields.slice(0, 25),
              footer: { text: `FlowForm Workflow Engine • ID: ${response.id}` },
              timestamp: new Date().toISOString(),
            },
          ],
        };
      } else if (isSlack) {
        payload = {
          text: `🎉 *New Form Submission for ${form.title}*\n${Object.entries(response.answers)
            .map(([k, v]) => `• *${k}*: ${v}`)
            .join('\n')}`,
        };
      } else {
        // Generic Webhook payload
        payload = {
          event: 'form_submission',
          formId: form.id,
          formTitle: form.title,
          responseId: response.id,
          submittedAt: response.submittedAt,
          answers: response.answers,
          respondentMeta: response.respondentMeta,
        };
      }

      // Non-blocking trigger with timeout
      fetch(wh.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(wh.headers || {}),
        },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn(`Webhook ${wh.url} delivery failed:`, err.message);
      });
    } catch (e) {
      console.warn('Webhook dispatch error:', e);
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    
    // The ID in the URL might be the schema ID, so we find the real form UUID
    const { data: dbForm } = await supabase
      .from('forms')
      .select('id')
      .contains('schema', { id: id })
      .single();

    if (!dbForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const { data: responses } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', dbForm.id);

    return NextResponse.json(responses || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // The ID in the URL is the schema ID, so we find the real form UUID
    const { data: dbForm } = await supabase
      .from('forms')
      .select('*')
      .contains('schema', { id: id })
      .single();

    if (!dbForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const body = await request.json();
    const meta = {
      device: body.respondentMeta?.device || 'desktop',
      durationSeconds: body.respondentMeta?.durationSeconds || 0,
      userAgent: body.respondentMeta?.userAgent || 'Browser',
    };

    let saved = null;
    let error = null;

    // 1. Try insert with metadata and respondent_meta
    const tryBoth = await supabase
      .from('responses')
      .insert({
        form_id: dbForm.id,
        answers: body.answers || {},
        metadata: meta,
        respondent_meta: meta,
        submitted_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle();

    if (!tryBoth.error && tryBoth.data) {
      saved = tryBoth.data;
    } else if (tryBoth.error) {
      // 2. Fallback to just metadata if respondent_meta doesn't exist
      const tryMeta = await supabase
        .from('responses')
        .insert({
          form_id: dbForm.id,
          answers: body.answers || {},
          metadata: meta,
          submitted_at: new Date().toISOString(),
        })
        .select('*')
        .maybeSingle();

      if (!tryMeta.error && tryMeta.data) {
        saved = tryMeta.data;
      } else {
        error = tryMeta.error || tryBoth.error;
        console.error('Supabase insert error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to submit response to database' }, { status: 500 });
      }
    }

    // Trigger registered webhooks asynchronously
    triggerWebhooks(dbForm.schema, saved);

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
}
