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

    // Resolve form_id to the actual forms table UUID if needed
    let dbFormId = form_id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(form_id));
    if (!isUuid) {
      const { data: matchedForm } = await supabase
        .from('forms')
        .select('id')
        .or(`public_slug.eq.${form_id},id.eq.${form_id}`)
        .maybeSingle();

      if (matchedForm?.id) {
        dbFormId = matchedForm.id;
      }
    }

    // Insert response into Supabase database
    let responseData = null;
    const submittedAt = new Date().toISOString();
    const meta = metadata || {};

    // 1. Try inserting with metadata and respondent_meta
    const { data: insertData, error: insertError } = await supabase
      .from('responses')
      .insert({
        form_id: dbFormId,
        answers,
        metadata: meta,
        respondent_meta: meta,
        submitted_at: submittedAt,
      })
      .select()
      .maybeSingle();

    if (!insertError && insertData) {
      responseData = insertData;
    } else if (insertError) {
      // 2. If respondent_meta column doesn't exist, retry with just metadata
      if (insertError.code === '42703' || insertError.message?.includes('respondent_meta')) {
        const { data: retryData, error: retryError } = await supabase
          .from('responses')
          .insert({
            form_id: dbFormId,
            answers,
            metadata: meta,
            submitted_at: submittedAt,
          })
          .select()
          .maybeSingle();

        if (!retryError && retryData) {
          responseData = retryData;
        } else if (retryError) {
          console.error('[Submit API Error] Supabase insert failed:', retryError);
          return NextResponse.json(
            { error: `Database insert failed: ${retryError.message}` },
            { status: 500 }
          );
        }
      } else {
        console.error('[Submit API Error] Supabase insert failed:', insertError);
        return NextResponse.json(
          { error: `Database insert failed: ${insertError.message}` },
          { status: 500 }
        );
      }
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
          if (integration.configuration?.url) {
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
            formTitle: dbForm?.title || 'Form Responses',
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
          redirect: 'follow',
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

