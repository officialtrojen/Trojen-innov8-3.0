import { NextResponse } from 'next/server';

// In-memory capture log for 1-tap instant live demo
let demoWebhookLogs: Array<{
  id: string;
  receivedAt: string;
  payload: any;
}> = [];

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const entry = {
      id: `wh_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      receivedAt: new Date().toISOString(),
      payload,
    };

    demoWebhookLogs.unshift(entry);
    if (demoWebhookLogs.length > 50) {
      demoWebhookLogs = demoWebhookLogs.slice(0, 50);
    }

    return NextResponse.json({
      success: true,
      status: 'delivered',
      receivedAt: entry.receivedAt,
      message: 'FormFlow 1-Tap Built-in Webhook Receiver captured payload successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Invalid payload body' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    total: demoWebhookLogs.length,
    logs: demoWebhookLogs,
  });
}

export async function DELETE() {
  demoWebhookLogs = [];
  return NextResponse.json({ success: true, message: 'Logs cleared' });
}
