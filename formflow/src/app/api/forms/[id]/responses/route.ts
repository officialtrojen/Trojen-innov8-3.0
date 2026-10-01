import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { FormResponse } from '@/types/form';
import {
  checkRateLimit,
  getClientIp,
  isSafeWebhookUrl,
  logSecurityEvent,
} from '@/lib/security';

async function triggerWebhooks(form: any, response: FormResponse, clientIp?: string) {
  if (!form.webhooks || !Array.isArray(form.webhooks)) return;

  const enabledWebhooks = form.webhooks.filter((w: any) => w.enabled && w.url);

  for (const wh of enabledWebhooks) {
    try {
      // OWASP A10: Server-Side Request Forgery (SSRF) Protection
      const urlCheck = isSafeWebhookUrl(wh.url);
      if (!urlCheck.safe) {
        logSecurityEvent(
          'SSRF_BLOCKED',
          { url: wh.url, reason: urlCheck.reason },
          clientIp
        );
        console.warn(`[OWASP A10 Blocked] Webhook URL rejected: ${wh.url} (${urlCheck.reason})`);
        continue;
      }

      const isDiscord = wh.url.includes('discord.com/api/webhooks');
      const isSlack = wh.url.includes('hooks.slack.com');

      let payload: any;

      if (isDiscord) {
        const fields = Object.entries(response.answers).map(([key, val]) => {
          const formField = form.fields.find((f: any) => f.id === key);
          const name = formField ? formField.label : key;
          return {
            name: String(name).slice(0, 256),
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

      // Non-blocking trigger with 6s timeout (OWASP A04 Denial of Service prevention)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      fetch(wh.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(wh.headers || {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
        .catch((err) => {
          console.warn(`Webhook ${wh.url} delivery failed:`, err.message);
        })
        .finally(() => {
          clearTimeout(timeoutId);
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
    const clientIp = getClientIp(request);
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // OWASP A01: Broken Access Control - Authenticate requester
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the real form
    const { data: dbForm } = await supabase
      .from('forms')
      .select('id, owner_id')
      .contains('schema', { id: id })
      .single();

    if (!dbForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // OWASP A01: Enforce ownership check (IDOR protection)
    if (dbForm.owner_id && dbForm.owner_id !== user.id) {
      logSecurityEvent(
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        { formId: dbForm.id, userId: user.id, action: 'read_responses' },
        clientIp
      );
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view these responses' },
        { status: 403 }
      );
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
    const clientIp = getClientIp(request);

    // OWASP A04: Rate limiting on public submissions (40/minute per IP)
    const rateLimit = checkRateLimit(`submit:${clientIp}`, 40, 60);
    if (!rateLimit.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { endpoint: '/api/forms/[id]/responses' }, clientIp);
      return NextResponse.json(
        { error: 'Too many submissions. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.resetSeconds) } }
      );
    }

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

    // Trigger registered webhooks asynchronously with SSRF validation
    triggerWebhooks(dbForm.schema, saved, clientIp);

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
}

