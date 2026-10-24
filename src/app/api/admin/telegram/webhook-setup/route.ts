// =============================================================================
// BRUH TESFA - Admin Telegram Webhook Setup & Status API
// (GET, POST, DELETE /api/admin/telegram/webhook-setup)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import {
  setTelegramWebhook,
  getTelegramWebhookInfo,
  deleteTelegramWebhook,
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const res = await getTelegramWebhookInfo();
  return NextResponse.json({
    success: res.ok,
    webhookInfo: res.result || null,
    error: res.description,
    isBotConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    isSecretConfigured: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
  });
}

export async function POST(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // Body optional, fallback to canonical app url
  }

  const baseUrl = (body.customAppUrl || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');
  if (!baseUrl || !baseUrl.startsWith('https://')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Telegram requires a public HTTPS URL for webhooks. Please provide a valid https:// domain.',
      },
      { status: 400 }
    );
  }

  const webhookUrl = `${baseUrl}/api/telegram/webhook`;
  const res = await setTelegramWebhook(webhookUrl);

  return NextResponse.json({
    success: res.ok,
    webhookUrl,
    result: res.result,
    error: res.description,
  });
}

export async function DELETE() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const res = await deleteTelegramWebhook();
  return NextResponse.json({
    success: res.ok,
    result: res.result,
    error: res.description,
  });
}
