import { NextResponse } from 'next/server';
import { getFormById, getResponses, saveResponse } from '@/lib/storage';
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
    const responses = await getResponses(id);
    return NextResponse.json(responses);
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
    const form = await getFormById(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const body = await request.json();
    const newResponse: FormResponse = {
      id: `resp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      formId: id,
      submittedAt: new Date().toISOString(),
      answers: body.answers || {},
      respondentMeta: {
        device: body.respondentMeta?.device || 'desktop',
        durationSeconds: body.respondentMeta?.durationSeconds || 0,
        userAgent: body.respondentMeta?.userAgent || 'Browser',
      },
    };

    const saved = await saveResponse(newResponse);

    // Trigger registered webhooks asynchronously
    triggerWebhooks(form, saved);

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
}
