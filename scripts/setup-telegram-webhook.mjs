#!/usr/bin/env node
// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Telegram Webhook Setup & Management CLI Tool
// Usage:
//   node scripts/setup-telegram-webhook.mjs status
//   node scripts/setup-telegram-webhook.mjs set https://your-domain.vercel.app
//   node scripts/setup-telegram-webhook.mjs delete
// =============================================================================

import fs from 'fs';
import path from 'path';

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
    if (match && !match[1].startsWith('#')) {
      const key = match[1];
      const val = (match[2] || '').trim().replace(/^['"](.*)['"]$/, '$1');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!botToken) {
  console.error('\n❌ ERROR: TELEGRAM_BOT_TOKEN is not set in environment or .env.local.\n');
  process.exit(1);
}

const args = process.argv.slice(2);
const command = args[0] || 'status';

async function main() {
  const baseUrl = `https://api.telegram.org/bot${botToken}`;

  if (command === 'status') {
    console.log('\n🔍 Checking current Telegram Webhook status...');
    const res = await fetch(`${baseUrl}/getWebhookInfo`);
    const data = await res.json();
    console.log('\nTelegram Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.ok && data.result?.url) {
      console.log(`\n✅ Active Webhook URL: ${data.result.url}`);
      console.log(`Pending update count: ${data.result.pending_update_count}`);
      if (data.result.last_error_message) {
        console.log(`⚠️ Last Delivery Error: ${data.result.last_error_message}`);
      }
    } else {
      console.log('\nℹ️ No active webhook is currently registered with Telegram.');
    }
  } else if (command === 'set') {
    let domain = args[1] || process.env.NEXT_PUBLIC_APP_URL;
    if (!domain) {
      console.error('\n❌ ERROR: Please supply your public HTTPS domain, e.g.:');
      console.error('node scripts/setup-telegram-webhook.mjs set https://bruhtesfa.vercel.app\n');
      process.exit(1);
    }

    domain = domain.replace(/\/+$/, '');
    if (!domain.startsWith('https://')) {
      console.error('\n❌ ERROR: Telegram requires HTTPS for webhook endpoints.\n');
      process.exit(1);
    }

    const webhookUrl = `${domain}/api/telegram/webhook`;
    console.log(`\n🚀 Registering Telegram Webhook: ${webhookUrl}`);

    const payload = {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: false,
    };

    if (webhookSecret) {
      payload.secret_token = webhookSecret;
      console.log('🔒 Attaching TELEGRAM_WEBHOOK_SECRET for signature verification.');
    }

    const res = await fetch(`${baseUrl}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('\nTelegram Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log('\n🎉 SUCCESS: Webhook successfully registered with Telegram Bot API!\n');
    } else {
      console.log('\n❌ Registration failed. Check the error message above.\n');
    }
  } else if (command === 'delete') {
    console.log('\n🗑️ Deleting registered Telegram Webhook...');
    const res = await fetch(`${baseUrl}/deleteWebhook`, { method: 'POST' });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    if (data.ok) {
      console.log('\n✅ Webhook removed successfully.\n');
    }
  } else {
    console.log('\nUsage:');
    console.log('  node scripts/setup-telegram-webhook.mjs status');
    console.log('  node scripts/setup-telegram-webhook.mjs set <https://your-domain>');
    console.log('  node scripts/setup-telegram-webhook.mjs delete\n');
  }
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
