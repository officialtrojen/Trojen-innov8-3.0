import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, headers } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    const isDiscord = url.includes('discord.com/api/webhooks');
    const isSlack = url.includes('hooks.slack.com');

    let samplePayload: any;

    if (isDiscord) {
      samplePayload = {
        username: 'FlowForm Test Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        embeds: [
          {
            title: '✅ FlowForm Webhook Test Successful!',
            description: 'Your webhook connection has been successfully established and verified.',
            color: 0x10b981, // emerald
            fields: [
              { name: 'Timestamp', value: new Date().toISOString(), inline: true },
              { name: 'Status', value: 'Connected (200 OK)', inline: true },
            ],
            footer: { text: 'FlowForm Workflow Builder • SBIT Hackathon 2026' },
          },
        ],
      };
    } else if (isSlack) {
      samplePayload = {
        text: '✅ *FlowForm Webhook Test*: Webhook connection successfully verified!',
      };
    } else {
      samplePayload = {
        event: 'test_ping',
        status: 'success',
        timestamp: new Date().toISOString(),
        message: 'FlowForm webhook integration ping verified.',
      };
    }

    const startTime = Date.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      body: JSON.stringify(samplePayload),
    });
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      statusText: res.statusText,
      durationMs: duration,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Webhook request failed' },
      { status: 500 }
    );
  }
}
