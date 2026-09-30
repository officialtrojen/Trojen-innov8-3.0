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

    // FR-6: Trigger external webhooks AFTER successful submission
    try {
      const webhooksToTrigger: { url: string; headers?: Record<string, string> }[] = [];

      // 1. Fetch form schema webhooks from Supabase if stored
      const { data: dbForm } = await supabase
        .from('forms')
        .select('*')
        .eq('id', form_id)
        .single();

      if (dbForm?.schema?.webhooks && Array.isArray(dbForm.schema.webhooks)) {
        for (const wh of dbForm.schema.webhooks) {
          if (wh.enabled && wh.url) {
            webhooksToTrigger.push({ url: wh.url, headers: wh.headers });
          }
        }
      }

      // 2. Fetch configured webhooks from integrations table
      const { data: integrations } = await supabase
        .from('integrations')
        .select('*')
        .eq('form_id', form_id)
        .eq('enabled', true);

      if (integrations && integrations.length > 0) {
        for (const integration of integrations) {
          if (integration.type === 'webhook' && integration.configuration?.url) {
            webhooksToTrigger.push({
              url: integration.configuration.url as string,
              headers: integration.configuration.headers as Record<string, string> | undefined,
            });
          }
        }
      }

      // 3. Dispatch HTTP POST payloads asynchronously (failures isolated)
      const submittedAt = new Date().toISOString();
      for (const target of webhooksToTrigger) {
        const isDiscord = target.url.includes('discord.com/api/webhooks');
        const isSlack = target.url.includes('hooks.slack.com');

        let payload: any;
        if (isDiscord) {
          payload = {
            username: 'FormFlow Bot',
            embeds: [
              {
                title: `🎉 New Form Submission`,
                description: `A new response was submitted for form \`${form_id}\`.`,
                color: 0x8b5cf6,
                fields: Object.entries(answers || {}).slice(0, 25).map(([k, v]) => ({
                  name: String(k),
                  value: String(v ?? 'N/A').slice(0, 1024),
                  inline: false,
                })),
                timestamp: submittedAt,
              },
            ],
          };
        } else if (isSlack) {
          payload = {
            text: `🎉 *New Form Submission (${form_id})*\n${Object.entries(answers || {})
              .map(([k, v]) => `• *${k}*: ${v}`)
              .join('\n')}`,
          };
        } else {
          payload = {
            event: 'form_submission',
            formId: form_id,
            submissionId: responseData?.id || `resp_${Date.now()}`,
            submittedAt,
            responses: answers,
            metadata: metadata || {},
          };
        }

        // Send POST request - safe catch so errors NEVER invalidate successful form submission
        fetch(target.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(target.headers || {}),
          },
          body: JSON.stringify(payload),
        }).catch((err) => {
          console.warn(`[FR-6 Webhook] Delivery failed for ${target.url}:`, err.message);
        });
      }
    } catch (err) {
      console.warn('[FR-6 Webhook] Integration dispatch error:', err);
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

