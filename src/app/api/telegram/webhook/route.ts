// =============================================================================
// BRUH TESFA - Official Telegram Bot HTTPS Webhook Handler
// (POST /api/telegram/webhook, GET /api/telegram/webhook)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyTelegramWebhookSecret, handleTelegramUpdate } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for operators & uptime monitors.
 * Never prints bot tokens or secret keys.
 */
export async function GET() {
  const isBotConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const isSecretConfigured = Boolean(process.env.TELEGRAM_WEBHOOK_SECRET);
  const isChannelConfigured = Boolean(process.env.TELEGRAM_CHANNEL_ID);

  return NextResponse.json({
    status: 'online',
    service: 'BRUH TESFA Telegram Bot Gateway',
    timestamp: new Date().toISOString(),
    configuration: {
      botTokenSet: isBotConfigured,
      webhookSecretSet: isSecretConfigured,
      channelIdSet: isChannelConfigured,
    },
  });
}

/**
 * Primary webhook entry point called by Telegram Bot API servers.
 */
export async function POST(request: Request) {
  try {
    // 1. Verify Secret Token Header
    const secretHeader = request.headers.get('x-telegram-bot-api-secret-token');
    const isVerified = verifyTelegramWebhookSecret(secretHeader);

    if (!isVerified) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized: invalid or missing webhook secret header' },
        { status: 401 }
      );
    }

    // 2. Parse Incoming Update Body safely
    let update: any;
    try {
      update = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    if (!update || typeof update !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Invalid update payload shape' },
        { status: 400 }
      );
    }

    // 3. Delegate to interactive router
    const result = await handleTelegramUpdate(update);

    // Always respond 200 OK so Telegram acknowledges receipt
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('Telegram webhook handler error:', error);
    // Respond 200 to prevent Telegram retry storm on unhandled internal errors
    return NextResponse.json({ ok: true, handled: false, error: 'Internal processing error' });
  }
}
