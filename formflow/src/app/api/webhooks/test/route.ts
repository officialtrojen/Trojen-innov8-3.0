import { NextResponse } from 'next/server';
import { isSafeWebhookUrl, checkRateLimit, getClientIp, logSecurityEvent } from '@/lib/security';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  // OWASP A04: Rate Limiting (max 10 webhook test attempts per minute per IP)
  const rateLimit = checkRateLimit(`webhook_test_${clientIp}`, 10, 60);
  if (!rateLimit.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { endpoint: '/api/webhooks/test' }, clientIp);
    return NextResponse.json(
      { error: `Too many webhook test requests. Please retry in ${rateLimit.resetSeconds}s.` },
      { status: 429 }
    );
  }

  // OWASP A01: Broken Access Control - Require authenticated user
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', { endpoint: '/api/webhooks/test' }, clientIp);
      return NextResponse.json({ error: 'Authentication required to test webhooks.' }, { status: 401 });
    }
  } catch {
    // If Supabase is unavailable in dev, continue with rate-limiting
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { url, headers } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    // OWASP A10: Server-Side Request Forgery (SSRF) Validation
    const safetyCheck = isSafeWebhookUrl(url);
    if (!safetyCheck.safe) {
      logSecurityEvent(
        'SSRF_BLOCKED',
        { attemptedUrl: url, reason: safetyCheck.reason },
        clientIp
      );
      return NextResponse.json(
        { error: safetyCheck.reason || 'Prohibited or unsafe destination URL.' },
        { status: 400 }
      );
    }

    const isDiscord = url.includes('discord.com/api/webhooks');
    const isSlack = url.includes('hooks.slack.com');
    const isGoogleSheets = url.includes('script.google.com') || url.includes('script.googleusercontent.com');

    let samplePayload: Record<string, unknown>;

    if (isDiscord) {
      samplePayload = {
        username: 'FormFlow Test Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        embeds: [
          {
            title: '✅ FormFlow Webhook Test Successful!',
            description: 'Your webhook connection has been successfully established and verified.',
            color: 0x10b981,
            fields: [
              { name: 'Timestamp', value: new Date().toISOString(), inline: true },
              { name: 'Status', value: 'Connected (200 OK)', inline: true },
            ],
            footer: { text: 'FormFlow Workflow Builder • BBIT Hackathon 2026' },
          },
        ],
      };
    } else if (isSlack) {
      samplePayload = {
        text: '✅ *FormFlow Webhook Test*: Webhook connection successfully verified!',
      };
    } else if (isGoogleSheets) {
      samplePayload = {
        event: 'test_ping',
        status: 'success',
        timestamp: new Date().toISOString(),
        formId: 'test_form',
        responses: {
          'Name': 'Test Respondent',
          'Email': 'test@example.com',
          'Feedback': 'FormFlow webhook connection is live and working!',
        },
      };
    } else {
      samplePayload = {
        event: 'test_ping',
        status: 'success',
        timestamp: new Date().toISOString(),
        message: 'FormFlow webhook integration ping verified.',
      };
    }

    // Abort controller with 8-second timeout to prevent DoS via slow responses
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const startTime = Date.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      body: JSON.stringify(samplePayload),
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      statusText: res.statusText,
      durationMs: duration,
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return NextResponse.json({ error: 'Webhook request timed out after 8 seconds.' }, { status: 504 });
    }
    return NextResponse.json(
      { error: 'Webhook delivery failed or unreachable.' },
      { status: 500 }
    );
  }
}
