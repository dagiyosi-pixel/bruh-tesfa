// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Telegram Bot, Alerts & Marketing Engine
// =============================================================================

import crypto from 'crypto';
import {
  TutoringVacancy,
  TelegramSubscriber,
  TelegramStudioTemplate,
  TelegramBroadcastLog,
} from './types';
import {
  getTelegramSubscriber,
  upsertTelegramSubscriber,
  unsubscribeTelegramSubscriber,
  getActiveTelegramSubscribers,
  recordTelegramBroadcastLog,
  getAdminVacancies,
  hasVacancyBeenBroadcast,
  getTelegramMarketingMetrics,
} from './db/storage';

export {
  getTelegramSubscriber,
  upsertTelegramSubscriber,
  unsubscribeTelegramSubscriber,
  getActiveTelegramSubscribers,
  recordTelegramBroadcastLog,
  hasVacancyBeenBroadcast,
  getTelegramMarketingMetrics,
};
import {
  DEFAULT_TELEGRAM_COMMUNITY_URL,
  DEFAULT_TELEGRAM_CHANNEL_URL,
  DEFAULT_SUPPORT_PHONE,
  DEFAULT_SUPPORT_EMAIL,
} from './constants';

export const TELEGRAM_BOT_BASE_URL = 'https://api.telegram.org/bot';

// -----------------------------------------------------------------------------
// 1. WEBHOOK SECURITY & TIMING-SAFE VALIDATION
// -----------------------------------------------------------------------------

/**
 * Validates the Telegram Webhook secret token using timingSafeEqual to prevent side-channel timing attacks.
 * Telegram passes this token in the header 'x-telegram-bot-api-secret-token'.
 */
export function verifyTelegramWebhookSecret(secretHeader: string | null | undefined): boolean {
  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  // In test / offline development mode where no webhook secret is set, we disallow empty in production
  if (!configuredSecret) {
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    // In local development or test mode, if no secret is configured, allow for testing
    return true;
  }

  if (!secretHeader) {
    return false;
  }

  const headerBuffer = Buffer.from(secretHeader);
  const secretBuffer = Buffer.from(configuredSecret);

  if (headerBuffer.length !== secretBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(headerBuffer, secretBuffer);
}

// -----------------------------------------------------------------------------
// 2. TELEGRAM BOT API CLIENT
// -----------------------------------------------------------------------------

export interface TelegramApiResponse<T = any> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

/**
 * Dispatches a POST request to the official Telegram Bot API.
 */
export async function callTelegramApi<T = any>(
  method: string,
  payload: Record<string, unknown>
): Promise<TelegramApiResponse<T>> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return {
      ok: false,
      description: 'TELEGRAM_BOT_TOKEN is not configured in environment variables.',
      error_code: 401,
    };
  }

  try {
    const endpoint = `${TELEGRAM_BOT_BASE_URL}${botToken}/${method}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json();
    return data as TelegramApiResponse<T>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown network failure';
    return {
      ok: false,
      description: `Telegram API communication error: ${message}`,
      error_code: 500,
    };
  }
}

/**
 * Sends a message with optional inline keyboard buttons.
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options?: {
    reply_markup?: any;
    parse_mode?: 'Markdown' | 'HTML';
    disable_web_page_preview?: boolean;
  }
): Promise<TelegramApiResponse> {
  return callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: options?.reply_markup,
    parse_mode: options?.parse_mode,
    disable_web_page_preview: options?.disable_web_page_preview ?? false,
  });
}

/**
 * Registers the HTTPS webhook with Telegram.
 */
export async function setTelegramWebhook(
  webhookUrl: string,
  secretToken?: string
): Promise<TelegramApiResponse> {
  const secret = secretToken || process.env.TELEGRAM_WEBHOOK_SECRET;
  const payload: Record<string, unknown> = {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false,
  };

  if (secret) {
    payload.secret_token = secret;
  }

  return callTelegramApi('setWebhook', payload);
}

/**
 * Retrieves the current webhook status from Telegram.
 */
export async function getTelegramWebhookInfo(): Promise<TelegramApiResponse> {
  return callTelegramApi('getWebhookInfo', {});
}

/**
 * Unregisters the webhook.
 */
export async function deleteTelegramWebhook(): Promise<TelegramApiResponse> {
  return callTelegramApi('deleteWebhook', {});
}

// -----------------------------------------------------------------------------
// 3. TRACKABLE CAMPAIGN URL GENERATION
// -----------------------------------------------------------------------------

export function generateTrackedLink(
  path: string,
  campaign: string = 'telegram_channel',
  medium: string = 'channel',
  source: string = 'telegram',
  baseUrlOverride?: string
): string {
  const baseUrl = (baseUrlOverride || process.env.NEXT_PUBLIC_APP_URL || 'https://bruhtesfa.et').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const separator = cleanPath.includes('?') ? '&' : '?';

  return `${baseUrl}${cleanPath}${separator}utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;
}

// -----------------------------------------------------------------------------
// 4. INTERACTIVE TELEGRAM BOT COMMANDS & INLINE KEYBOARDS
// -----------------------------------------------------------------------------

export function getMainBotMenuKeyboard() {
  const findUrl = generateTrackedLink('/request-tutor', 'bot_menu', 'bot');
  const vacanciesUrl = generateTrackedLink('/vacancies', 'bot_menu', 'bot');
  const teachUrl = generateTrackedLink('/become-a-tutor', 'bot_menu', 'bot');
  const webAppUrl = generateTrackedLink('/', 'bot_menu', 'bot');
  const shareText = encodeURIComponent(
    'Find screened, trustworthy private home and online tutors in Addis Ababa through Bruh Tesfa (ብሩህ ተስፋ): https://bruhtesfa.et'
  );
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://bruhtesfa.et')}&text=${shareText}`;

  return {
    inline_keyboard: [
      [
        { text: '🔍 Find a Tutor', url: findUrl },
        { text: '📋 View Vacancies', callback_data: 'cmd_vacancies' },
      ],
      [
        { text: '👨‍🏫 Register as Tutor', url: teachUrl },
        { text: '🔔 Vacancy Alerts', callback_data: 'cmd_alerts' },
      ],
      [
        { text: '🌐 Open Bruh Tesfa', url: webAppUrl },
        { text: '📣 Share With Friends', url: shareUrl },
      ],
      [
        { text: '📞 Contact Support', callback_data: 'cmd_contact' },
      ],
    ],
  };
}

export function getAlertPreferencesKeyboard(subscriber: TelegramSubscriber) {
  const subjectsList = ['Mathematics', 'Physics', 'English', 'Chemistry', 'Biology'];
  const subCitiesList = ['Bole', 'Yeka', 'Kirkos', 'Arada'];

  const subjectButtons = subjectsList.map((subj) => {
    const isSelected = subscriber.subjects.includes(subj);
    return {
      text: `${isSelected ? '✅' : '➕'} ${subj}`,
      callback_data: `sub_subj_${subj.toLowerCase()}`,
    };
  });

  const subCityButtons = subCitiesList.map((city) => {
    const isSelected = subscriber.sub_cities.includes(city);
    return {
      text: `${isSelected ? '✅' : '➕'} ${city}`,
      callback_data: `sub_city_${city.toLowerCase()}`,
    };
  });

  // Split into rows of 2
  const subjectRows: any[][] = [];
  for (let i = 0; i < subjectButtons.length; i += 2) {
    subjectRows.push(subjectButtons.slice(i, i + 2));
  }

  const subCityRows: any[][] = [];
  for (let i = 0; i < subCityButtons.length; i += 2) {
    subCityRows.push(subCityButtons.slice(i, i + 2));
  }

  return {
    inline_keyboard: [
      ...subjectRows,
      ...subCityRows,
      [
        {
          text: `Format: ${subscriber.teaching_format.toUpperCase()}`,
          callback_data: 'sub_fmt_toggle',
        },
        { text: '🛑 Stop Alerts (/stop)', callback_data: 'sub_unsubscribe' },
      ],
      [
        { text: '« Back to Main Menu', callback_data: 'cmd_start' },
      ],
    ],
  };
}

/**
 * Main update router for incoming Telegram messages and button callbacks.
 */
export async function handleTelegramUpdate(update: any): Promise<{
  handled: boolean;
  action?: string;
  response?: string;
}> {
  if (!update) return { handled: false };

  // 1. Handle Callback Query (Button taps)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const data = cb.data as string;
    const fromUser = cb.from;

    if (!chatId) return { handled: false };

    if (data === 'cmd_start') {
      const text = getStartMessage(fromUser?.first_name || 'Friend');
      await sendTelegramMessage(chatId, text, {
        reply_markup: getMainBotMenuKeyboard(),
      });
      return { handled: true, action: 'menu_start' };
    }

    if (data === 'cmd_vacancies') {
      const vacancies = await getAdminVacancies();
      const openVacancies = vacancies.filter((v) => v.status === 'open' || v.status === 'closing_soon').slice(0, 3);

      if (openVacancies.length === 0) {
        await sendTelegramMessage(
          chatId,
          '📋 Currently, all recent tutoring vacancies have been filled. New verified requests are posted weekly!\n\nUse the link below to check all vacancies or register your tutor profile.',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🌐 Open Vacancy Board', url: generateTrackedLink('/vacancies', 'bot_vacancies_empty', 'bot') }],
                [{ text: '« Main Menu', callback_data: 'cmd_start' }],
              ],
            },
          }
        );
      } else {
        const text = [
          '📢 *RECENT OPEN VACANCIES IN ADDIS ABABA*',
          '',
          ...openVacancies.map(
            (v, idx) =>
              `${idx + 1}. *${v.title}* (${v.vacancy_code})\n` +
              `   📍 ${v.sub_city} • 📚 ${v.grade_level}\n` +
              `   💰 ${v.hourly_rate_etb} ETB/hr • ⏱ ${v.hours_per_session} hrs/lesson\n` +
              `   🔗 [Apply Online](${generateTrackedLink(`/vacancies/${v.vacancy_code}`, 'bot_vacancies_list', 'bot')})\n`
          ),
          '🛡 *Safeguarding*: All in-person tutoring takes place with parent presence in the residence (Proc. No. 1321/2024).',
        ].join('\n');

        await sendTelegramMessage(chatId, text, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📋 View All Vacancies Online', url: generateTrackedLink('/vacancies', 'bot_all_vacancies', 'bot') }],
              [{ text: '« Main Menu', callback_data: 'cmd_start' }],
            ],
          },
        });
      }
      return { handled: true, action: 'show_vacancies' };
    }

    if (data === 'cmd_contact') {
      const text = [
        '📞 *BRUH TESFA COORDINATION DESK*',
        '',
        `📱 Telephone / SMS: ${DEFAULT_SUPPORT_PHONE}`,
        `📧 Email: ${DEFAULT_SUPPORT_EMAIL}`,
        `💬 Telegram Community: ${DEFAULT_TELEGRAM_COMMUNITY_URL}`,
        `📢 Official Announcements: ${DEFAULT_TELEGRAM_CHANNEL_URL}`,
        '',
        'Our coordination desk operates Monday through Saturday, 8:30 AM to 6:00 PM (EAT).',
      ].join('\n');

      await sendTelegramMessage(chatId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '💬 Join Discussion Community', url: DEFAULT_TELEGRAM_COMMUNITY_URL }],
            [{ text: '« Main Menu', callback_data: 'cmd_start' }],
          ],
        },
      });
      return { handled: true, action: 'show_contact' };
    }

    if (data === 'cmd_alerts') {
      let sub = await getTelegramSubscriber(chatId);
      if (!sub) {
        sub = await upsertTelegramSubscriber({
          chat_id: chatId,
          username: fromUser?.username,
          first_name: fromUser?.first_name,
          is_active: true,
        });
      }

      const text = getAlertSettingsMessage(sub);
      await sendTelegramMessage(chatId, text, {
        parse_mode: 'Markdown',
        reply_markup: getAlertPreferencesKeyboard(sub),
      });
      return { handled: true, action: 'show_alerts' };
    }

    if (data.startsWith('sub_subj_')) {
      const subjKey = data.replace('sub_subj_', '');
      const subjectMap: Record<string, string> = {
        mathematics: 'Mathematics',
        physics: 'Physics',
        english: 'English',
        chemistry: 'Chemistry',
        biology: 'Biology',
      };
      const cleanSubj = subjectMap[subjKey] || subjKey;

      let sub = await getTelegramSubscriber(chatId);
      if (!sub) {
        sub = await upsertTelegramSubscriber({ chat_id: chatId, is_active: true });
      }

      const currentSubjects = sub.subjects || [];
      const updatedSubjects = currentSubjects.includes(cleanSubj)
        ? currentSubjects.filter((s) => s !== cleanSubj)
        : [...currentSubjects, cleanSubj];

      const updated = await upsertTelegramSubscriber({
        chat_id: chatId,
        subjects: updatedSubjects,
        is_active: true,
      });

      await sendTelegramMessage(chatId, getAlertSettingsMessage(updated), {
        parse_mode: 'Markdown',
        reply_markup: getAlertPreferencesKeyboard(updated),
      });
      return { handled: true, action: 'toggle_subject' };
    }

    if (data.startsWith('sub_city_')) {
      const cityKey = data.replace('sub_city_', '');
      const cityMap: Record<string, string> = {
        bole: 'Bole',
        yeka: 'Yeka',
        kirkos: 'Kirkos',
        arada: 'Arada',
      };
      const cleanCity = cityMap[cityKey] || cityKey;

      let sub = await getTelegramSubscriber(chatId);
      if (!sub) {
        sub = await upsertTelegramSubscriber({ chat_id: chatId, is_active: true });
      }

      const currentCities = sub.sub_cities || [];
      const updatedCities = currentCities.includes(cleanCity)
        ? currentCities.filter((c) => c !== cleanCity)
        : [...currentCities, cleanCity];

      const updated = await upsertTelegramSubscriber({
        chat_id: chatId,
        sub_cities: updatedCities,
        is_active: true,
      });

      await sendTelegramMessage(chatId, getAlertSettingsMessage(updated), {
        parse_mode: 'Markdown',
        reply_markup: getAlertPreferencesKeyboard(updated),
      });
      return { handled: true, action: 'toggle_subcity' };
    }

    if (data === 'sub_fmt_toggle') {
      let sub = await getTelegramSubscriber(chatId);
      if (!sub) {
        sub = await upsertTelegramSubscriber({ chat_id: chatId, is_active: true });
      }

      const nextFormat: Record<string, 'in_person' | 'online' | 'either'> = {
        either: 'in_person',
        in_person: 'online',
        online: 'either',
      };
      const newFmt = nextFormat[sub.teaching_format || 'either'] || 'either';

      const updated = await upsertTelegramSubscriber({
        chat_id: chatId,
        teaching_format: newFmt,
        is_active: true,
      });

      await sendTelegramMessage(chatId, getAlertSettingsMessage(updated), {
        parse_mode: 'Markdown',
        reply_markup: getAlertPreferencesKeyboard(updated),
      });
      return { handled: true, action: 'toggle_format' };
    }

    if (data === 'sub_unsubscribe') {
      await unsubscribeTelegramSubscriber(chatId);
      await sendTelegramMessage(
        chatId,
        '🛑 *You have been unsubscribed from vacancy alerts.*\n\nYou will receive no further automated notifications. Type /start or /alerts anytime to re-subscribe.',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '« Main Menu', callback_data: 'cmd_start' }]],
          },
        }
      );
      return { handled: true, action: 'unsubscribe' };
    }
  }

  // 2. Handle Text Messages & Slash Commands
  if (update.message?.text) {
    const text = update.message.text.trim();
    const chatId = update.message.chat.id;
    const fromUser = update.message.from;

    // Command: /start
    if (text.startsWith('/start')) {
      // Auto-register subscriber record for alerts
      await upsertTelegramSubscriber({
        chat_id: chatId,
        username: fromUser?.username,
        first_name: fromUser?.first_name,
        is_active: true,
      });

      const welcome = getStartMessage(fromUser?.first_name || 'Friend');
      await sendTelegramMessage(chatId, welcome, {
        reply_markup: getMainBotMenuKeyboard(),
      });
      return { handled: true, action: 'command_start' };
    }

    // Command: /help
    if (text.startsWith('/help')) {
      const helpText = [
        '💡 *BRUH TESFA BOT COMMANDS & HELP*',
        '',
        '• `/start` — Return to main menu and welcome screen',
        '• `/find` — Request a private home or online tutor',
        '• `/vacancies` — View current open tutoring opportunities',
        '• `/teach` — Register as a screened tutor with Bruh Tesfa',
        '• `/alerts` — Customize or check your opt-in vacancy alert preferences',
        '• `/contact` — Reach human tutoring coordinators',
        '• `/stop` — Unsubscribe from all optional vacancy alerts',
        '',
        '🛡 *Legal & Safeguarding Commitment*:',
        'Bruh Tesfa enforces parental presence in the residence for in-person tutoring under Ethiopian Proclamation No. 1321/2024. All tutors are identity-verified with Kebele ID and university credentials.',
      ].join('\n');

      await sendTelegramMessage(chatId, helpText, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔍 Find a Tutor', url: generateTrackedLink('/request-tutor', 'bot_help', 'bot') }],
            [{ text: '« Main Menu', callback_data: 'cmd_start' }],
          ],
        },
      });
      return { handled: true, action: 'command_help' };
    }

    // Command: /find
    if (text.startsWith('/find')) {
      const findText = [
        '🎯 *FIND A TRUSTWORTHY TUTOR IN ADDIS ABABA*',
        '',
        '1. Tell us your student\'s grade level, subject, and sub-city.',
        '2. Our coordinators match you with top screened university educators.',
        '3. Try a risk-free trial session with parent presence.',
        '',
        '👉 Tap below to submit your parent request in 2 minutes:',
      ].join('\n');

      await sendTelegramMessage(chatId, findText, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📝 Submit Parent Request', url: generateTrackedLink('/request-tutor', 'bot_find_command', 'bot') }],
            [{ text: '« Main Menu', callback_data: 'cmd_start' }],
          ],
        },
      });
      return { handled: true, action: 'command_find' };
    }

    // Command: /vacancies
    if (text.startsWith('/vacancies')) {
      const vacancies = await getAdminVacancies();
      const openVacancies = vacancies.filter((v) => v.status === 'open' || v.status === 'closing_soon').slice(0, 3);

      const msg = [
        '📢 *OPEN TUTORING VACANCIES*',
        '',
        ...openVacancies.map(
          (v) =>
            `• *${v.title}* (${v.vacancy_code})\n` +
            `  📍 ${v.sub_city} • 💰 ${v.hourly_rate_etb} ETB/hr\n` +
            `  [View & Apply Online](${generateTrackedLink(`/vacancies/${v.vacancy_code}`, 'bot_vacancies_cmd', 'bot')})\n`
        ),
      ].join('\n');

      await sendTelegramMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 View All Vacancies', url: generateTrackedLink('/vacancies', 'bot_vacancies_cmd_btn', 'bot') }],
            [{ text: '« Main Menu', callback_data: 'cmd_start' }],
          ],
        },
      });
      return { handled: true, action: 'command_vacancies' };
    }

    // Command: /teach
    if (text.startsWith('/teach')) {
      const teachText = [
        '👨‍🏫 *BECOME A BRUH TESFA TUTOR*',
        '',
        'Are you an exceptional teacher, university graduate, or top STEM student?',
        '',
        '✨ *Why Join Bruh Tesfa:*',
        '• Set your own hourly rate in ETB.',
        '• Work in your preferred Addis Ababa sub-cities or online.',
        '• Transparent placement: 60% placement fee on month 1 only; 100% of all ongoing fees belong to you!',
        '• Verified families and safeguarded home environments.',
        '',
        '👉 Submit your application online with your Kebele ID & university credentials:',
      ].join('\n');

      await sendTelegramMessage(chatId, teachText, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✍️ Register as a Tutor', url: generateTrackedLink('/become-a-tutor', 'bot_teach_cmd', 'bot') }],
            [{ text: '« Main Menu', callback_data: 'cmd_start' }],
          ],
        },
      });
      return { handled: true, action: 'command_teach' };
    }

    // Command: /alerts
    if (text.startsWith('/alerts')) {
      let sub = await getTelegramSubscriber(chatId);
      if (!sub) {
        sub = await upsertTelegramSubscriber({
          chat_id: chatId,
          username: fromUser?.username,
          first_name: fromUser?.first_name,
          is_active: true,
        });
      }

      await sendTelegramMessage(chatId, getAlertSettingsMessage(sub), {
        parse_mode: 'Markdown',
        reply_markup: getAlertPreferencesKeyboard(sub),
      });
      return { handled: true, action: 'command_alerts' };
    }

    // Command: /contact
    if (text.startsWith('/contact')) {
      const contactText = [
        '📞 *BRUH TESFA CONTACT & SUPPORT*',
        '',
        `📱 Telephone: ${DEFAULT_SUPPORT_PHONE}`,
        `📧 Email: ${DEFAULT_SUPPORT_EMAIL}`,
        `💬 Community Group: ${DEFAULT_TELEGRAM_COMMUNITY_URL}`,
        `📢 Channel: ${DEFAULT_TELEGRAM_CHANNEL_URL}`,
      ].join('\n');

      await sendTelegramMessage(chatId, contactText, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💬 Open Community Group', url: DEFAULT_TELEGRAM_COMMUNITY_URL }],
            [{ text: '« Main Menu', callback_data: 'cmd_start' }],
          ],
        },
      });
      return { handled: true, action: 'command_contact' };
    }

    // Command: /stop
    if (text.startsWith('/stop')) {
      await unsubscribeTelegramSubscriber(chatId);
      await sendTelegramMessage(
        chatId,
        '🛑 *You have been unsubscribed from Bruh Tesfa vacancy alerts.*\n\nWe will not send you any more notifications. Type /start anytime to reactivate your subscription.',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '« Return to Main Menu', callback_data: 'cmd_start' }]],
          },
        }
      );
      return { handled: true, action: 'command_stop' };
    }

    // Fallback for unknown text
    const fallbackText =
      '👋 Hello! I am the automated assistant for **BRUH TESFA (ብሩህ ተስፋ)**.\n\nUse the buttons below to find a tutor, browse vacancies, or configure alerts, or type /help for assistance.';
    await sendTelegramMessage(chatId, fallbackText, {
      reply_markup: getMainBotMenuKeyboard(),
    });
    return { handled: true, action: 'unknown_command_fallback' };
  }

  return { handled: false };
}

function getStartMessage(firstName: string): string {
  return [
    `🌟 Welcome to BRUH TESFA (ብሩህ ተስፋ), ${firstName}!`,
    ``,
    `We connect Ethiopian parents and students with vetted, reliable, and background-checked private tutors across Addis Ababa.`,
    ``,
    `Choose an action below to get started:`,
  ].join('\n');
}

function getAlertSettingsMessage(subscriber: TelegramSubscriber): string {
  const activeStatus = subscriber.is_active ? '🟢 ACTIVE' : '🔴 PAUSED / STOPPED';
  const subjectsStr = subscriber.subjects.length > 0 ? subscriber.subjects.join(', ') : 'All Subjects (No Filter)';
  const subCitiesStr = subscriber.sub_cities.length > 0 ? subscriber.sub_cities.join(', ') : 'All Addis Ababa Sub-Cities';
  const formatStr =
    subscriber.teaching_format === 'in_person'
      ? 'In-Person Only'
      : subscriber.teaching_format === 'online'
      ? 'Online Only'
      : 'Either (In-Person or Online)';

  return [
    `🔔 *YOUR VACANCY ALERT PREFERENCES*`,
    ``,
    `Status: ${activeStatus}`,
    `📚 Subjects: ${subjectsStr}`,
    `📍 Areas: ${subCitiesStr}`,
    `🏛 Format: ${formatStr}`,
    ``,
    `🛡 *Privacy Disclosure*: Bruh Tesfa stores only your Telegram chat ID and selected academic preferences to notify you of relevant opportunities. No private chats or personal files are stored.`,
    ``,
    `Tap the buttons below to toggle your preferences:`,
  ].join('\n');
}

// -----------------------------------------------------------------------------
// 5. SUBSCRIBER MATCHING & VACANCY ALERT DISPATCH
// -----------------------------------------------------------------------------

/**
 * Matches active Telegram subscribers against an approved vacancy.
 */
export function matchSubscribersForVacancy(
  subscribers: TelegramSubscriber[],
  vacancy: TutoringVacancy
): TelegramSubscriber[] {
  return subscribers.filter((sub) => {
    if (!sub.is_active) return false;

    // 1. Format check
    if (sub.teaching_format === 'in_person' && vacancy.teaching_format === 'online') {
      return false;
    }
    if (sub.teaching_format === 'online' && vacancy.teaching_format === 'in_person') {
      return false;
    }

    // 2. Sub-city check (only if subscriber specified locations and vacancy is in-person)
    if (
      sub.sub_cities.length > 0 &&
      vacancy.teaching_format !== 'online' &&
      !sub.sub_cities.some((c) => c.toLowerCase() === vacancy.sub_city.toLowerCase())
    ) {
      return false;
    }

    // 3. Subject check (if subscriber specified subjects, at least one must match)
    if (sub.subjects.length > 0) {
      const hasSubjectMatch = vacancy.subjects.some((vs) =>
        sub.subjects.some((ss) => ss.toLowerCase().includes(vs.toLowerCase()) || vs.toLowerCase().includes(ss.toLowerCase()))
      );
      if (!hasSubjectMatch) return false;
    }

    return true;
  });
}

/**
 * Dispatches targeted vacancy alert messages to all matching subscribers.
 */
export async function dispatchVacancyAlertsToSubscribers(
  vacancy: TutoringVacancy,
  customBaseUrl?: string
): Promise<{ notifiedCount: number; errors: number; skippedCount: number }> {
  const subscribers = await getActiveTelegramSubscribers();
  const matched = matchSubscribersForVacancy(subscribers, vacancy);

  let notifiedCount = 0;
  let errors = 0;

  const baseUrl = customBaseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://bruhtesfa.et';
  const applyUrl = `${baseUrl.replace(/\/+$/, '')}/vacancies/${vacancy.vacancy_code}?utm_source=telegram&utm_medium=bot_alert&utm_campaign=vacancy_alert`;

  const alertText = [
    `🔔 *NEW MATCHING VACANCY ALERT*`,
    `ብሩህ ተስፋ — አዲስ የስራ እድል ለእርስዎ ተዛማጅ`,
    ``,
    `📌 *${vacancy.title}* (${vacancy.vacancy_code})`,
    `📍 Location: ${vacancy.sub_city}${vacancy.general_area ? ` (${vacancy.general_area})` : ''}`,
    `📚 Grade: ${vacancy.grade_level}`,
    `🔬 Subjects: ${vacancy.subjects.join(', ')}`,
    `💰 Rate: ${Number(vacancy.hourly_rate_etb).toLocaleString()} ETB / hour`,
    `🗓 Schedule: ${vacancy.lesson_frequency} • ${vacancy.time_window || 'Afternoon'}`,
    ``,
    `👉 [Tap Here to Review & Apply Online](${applyUrl})`,
    ``,
    `To adjust your alert filters, type /alerts. To unsubscribe, type /stop.`,
  ].join('\n');

  for (const sub of matched) {
    try {
      const res = await sendTelegramMessage(sub.chat_id, alertText, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✍️ Apply for this Vacancy', url: applyUrl }],
            [{ text: '⚙️ Manage Alerts', callback_data: 'cmd_alerts' }],
          ],
        },
      });

      if (res.ok) {
        notifiedCount++;
      } else {
        errors++;
        // If user blocked the bot (403 Forbidden), auto-unsubscribe to stay clean
        if (res.error_code === 403) {
          await unsubscribeTelegramSubscriber(sub.chat_id);
        }
      }
    } catch {
      errors++;
    }
  }

  return { notifiedCount, errors, skippedCount: subscribers.length - matched.length };
}

// -----------------------------------------------------------------------------
// 6. CHANNEL BROADCAST & VACANCY ANNOUNCEMENT (COPY-READY & AUTO-PUBLISH)
// -----------------------------------------------------------------------------

/**
 * Generates an attractive, high-converting Telegram channel broadcast text.
 */
export function generateTelegramVacancyAnnouncement(
  vacancy: TutoringVacancy,
  customBaseUrl?: string
): string {
  const baseUrl = customBaseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://bruhtesfa.et';
  const applyUrl = `${baseUrl.replace(/\/+$/, '')}/vacancies/${vacancy.vacancy_code}?utm_source=telegram&utm_medium=channel&utm_campaign=vacancy_announcement`;

  const subjectsList = vacancy.subjects.join(', ');
  const daysList = vacancy.schedule_days.length > 0 ? vacancy.schedule_days.join(', ') : vacancy.lesson_frequency;
  const languagesList = vacancy.languages.join(' & ');
  const modeLabel =
    vacancy.teaching_format === 'in_person'
      ? 'In-Person Home Tutoring'
      : vacancy.teaching_format === 'online'
      ? 'Online Tutoring'
      : 'In-Person or Online';

  const monthlyEst = Math.round(vacancy.hourly_rate_etb * (vacancy.hours_per_session || 1.5) * 3 * 4);

  return [
    `📢 [BRUH TESFA] NEW TUTORING VACANCY`,
    `ብሩህ ተስፋ — አዲስ የማስተማር የስራ እድል`,
    ``,
    `📌 Vacancy Code: ${vacancy.vacancy_code}`,
    `🎯 Title: ${vacancy.title}`,
    ``,
    `📍 Location: ${vacancy.sub_city}${vacancy.general_area ? ` (${vacancy.general_area})` : ''}, Addis Ababa`,
    `📚 Grade & Level: ${vacancy.grade_level}`,
    `📖 Curriculum: ${vacancy.curriculum}`,
    `🔬 Required Subjects: ${subjectsList}`,
    `🏛 Teaching Format: ${modeLabel}`,
    `🗓 Schedule: ${daysList} • ${vacancy.time_window || 'Afternoon hours'}`,
    `⏱ Session Duration: ${vacancy.hours_per_session || 1.5} hrs/lesson (${vacancy.lesson_frequency})`,
    `💰 Pay Rate: ${Number(vacancy.hourly_rate_etb).toLocaleString()} ETB / hour (~${monthlyEst.toLocaleString()} ETB/month)`,
    `🎓 Minimum Qualification: ${vacancy.required_qualifications}`,
    `🗣 Teaching Language: ${languagesList}`,
    ...(vacancy.parent_preferences ? [`💡 Family Note: ${vacancy.parent_preferences}`] : []),
    ...(vacancy.application_deadline ? [`⏳ Application Deadline: ${vacancy.application_deadline}`] : []),
    ``,
    `🛡 Safeguarding Notice:`,
    `In-person lessons must occur with parent or guardian presence in the residence (Proc. No. 1321/2024).`,
    ``,
    `🔗 Apply Directly Online (Instant Profile Matching):`,
    `${applyUrl}`,
    ``,
    `✨ Verified by Bruh Tesfa Tutoring Coordination Desk`,
    `Telegram Community: ${DEFAULT_TELEGRAM_COMMUNITY_URL}`,
  ].join('\n');
}

/**
 * Publishes a vacancy announcement to the configured Telegram announcement channel.
 * Supports an optional custom edited caption from the admin studio.
 */
export async function publishVacancyToTelegramChannel(
  vacancy: TutoringVacancy,
  customBaseUrl?: string,
  customCaption?: string
): Promise<{ success: boolean; messageId?: string; error?: string; simulated?: boolean }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    return {
      success: false,
      error:
        'Telegram bot credentials not configured in environment variables (TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID). Use manual copy-paste mode.',
      simulated: true,
    };
  }

  const messageText = customCaption?.trim() || generateTelegramVacancyAnnouncement(vacancy, customBaseUrl);

  try {
    const telegramEndpoint = `${TELEGRAM_BOT_BASE_URL}${botToken}/sendMessage`;
    const res = await fetch(telegramEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: messageText,
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        success: false,
        error: data.description || 'Failed to dispatch message to Telegram channel',
      };
    }

    const messageId = String(data.result?.message_id);

    // Record in broadcast log
    await recordTelegramBroadcastLog({
      vacancy_id: vacancy.id,
      channel_id: channelId,
      message_id: messageId,
      broadcast_type: 'channel_announcement',
      recipient_count: 1,
      status: 'published',
      caption_snippet: messageText.slice(0, 150),
    });

    return {
      success: true,
      messageId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error during Telegram dispatch';
    return { success: false, error: msg };
  }
}

// -----------------------------------------------------------------------------
// 7. TELEGRAM CONTENT STUDIO - 12 BRANDED MARKETING TEMPLATES
// -----------------------------------------------------------------------------

export function getContentStudioTemplates(): TelegramStudioTemplate[] {
  return [
    {
      id: 'tpl-01',
      key: 'vacancy_announcement',
      title: 'A. Single Vacancy Announcement',
      category: 'vacancy',
      call_to_action: 'Apply for Vacancy Online',
      target_url_path: '/vacancies',
      default_campaign: 'tg_vacancy_alert',
      default_caption_en:
        '📢 [BRUH TESFA] NEW TUTORING VACANCY\n\n📌 Code: {{VACANCY_CODE}}\n🎯 Title: {{TITLE}}\n📍 Location: {{LOCATION}}\n📚 Grade: {{GRADE}}\n💰 Pay: {{HOURLY_RATE}} ETB/hour\n🗓 Schedule: {{SCHEDULE}}\n\n👉 Apply directly: {{APPLY_URL}}\n\n🛡 Safeguarding: In-person lessons require parental presence (Proc. No. 1321/2024).',
      default_caption_am:
        '📢 [ብሩህ ተስፋ] አዲስ የማስተማር የስራ እድል\n\n📌 የስራ ኮድ: {{VACANCY_CODE}}\n🎯 ርዕስ: {{TITLE}}\n📍 አካባቢ: {{LOCATION}}\n📚 የክፍል ደረጃ: {{GRADE}}\n💰 ክፍያ: {{HOURLY_RATE}} ብር/ሰዓት\n🗓 ፕሮግራም: {{SCHEDULE}}\n\n👉 በመስመር ላይ ያመልክቱ: {{APPLY_URL}}\n\n🛡 ደህንነት: በአካል የሚሰጡ ትምህርቶች የወላጅ መገኘት ግዴታ ነው::',
    },
    {
      id: 'tpl-02',
      key: 'weekly_roundup',
      title: 'B. Weekly Vacancy Roundup',
      category: 'vacancy',
      call_to_action: 'View All Open Vacancies',
      target_url_path: '/vacancies',
      default_campaign: 'tg_weekly_roundup',
      default_caption_en:
        '🌟 BRUH TESFA — WEEKLY TUTORING VACANCIES ROUNDUP\n\nLooking for rewarding tutoring opportunities in Addis Ababa this week? Here are our top verified openings:\n\n{{VACANCY_LIST}}\n\nAll families are vetted and payment is secured through Bruh Tesfa.\n\n👉 Browse all opportunities: {{TARGET_URL}}\n\nTelegram Community: https://t.me/bruh_tesfa_tutoring_ethiopia',
      default_caption_am:
        '🌟 ብሩህ ተስፋ — የሳምንቱ የተመረጡ የማስተማር የስራ እድሎች\n\nበአዲስ አበባ ውስጥ ጥራት ያለው የማስተማር ስራ ይፈልጋሉ? በዚህ ሳምንት ክፍት የሆኑ እድሎች:\n\n{{VACANCY_LIST}}\n\n👉 ሁሉንም ክፍት ቦታዎች ይመልከቱ: {{TARGET_URL}}',
    },
    {
      id: 'tpl-03',
      key: 'tutor_recruitment',
      title: 'C. Tutor Recruitment Campaign',
      category: 'tutor_recruitment',
      call_to_action: 'Register as a Tutor',
      target_url_path: '/become-a-tutor',
      default_campaign: 'tg_tutor_recruitment',
      default_caption_en:
        '👨‍🏫 TEACH WITH BRUH TESFA (ብሩህ ተስፋ)\n\nAre you a passionate teacher, university graduate, or top STEM student in Addis Ababa?\n\n✨ Why teach with us:\n• Set your own hourly rate in ETB\n• Choose your preferred sub-cities (Bole, Yeka, Kirkos, etc.) or teach online\n• Transparent 60% placement fee on Month 1 ONLY — 100% of all ongoing months belong to you!\n• Prompt weekly payouts & verified families\n\n👉 Join our educator network today: {{TARGET_URL}}',
      default_caption_am:
        '👨‍🏫 በብሩህ ተስፋ አስተማሪ ይሁኑ\n\nበአዲስ አበባ ውስጥ ጎበዝ መምህር፣ የዩኒቨርሲቲ ተመራቂ ወይንም ተማሪ ነዎት?\n\n✨ ከእኛ ጋር ማስተማር ለምን ይጠቅማል:\n• የሰዓት ክፍያዎን እራስዎ ይወስናሉ\n• የሚመችዎትን ሰፈር መርጠው ያስተምራሉ\n• ለአንደኛው ወር ብቻ የኮሚሽን ክፍያ — ከሁለተኛው ወር ጀምሮ ሙሉ ክፍያው የእርስዎ ነው!\n\n👉 አሁኑኑ ይመዝገቡ: {{TARGET_URL}}',
    },
    {
      id: 'tpl-04',
      key: 'parent_promo',
      title: 'D. Parent-Facing Tutor Match Promotion',
      category: 'parent_promo',
      call_to_action: 'Request a Vetted Tutor',
      target_url_path: '/request-tutor',
      default_campaign: 'tg_parent_find',
      default_caption_en:
        '🎓 STRUGGLING TO FIND A TRUSTWORTHY HOME TUTOR?\n\nBRUH TESFA connects families with verified, high-performing educators for:\n• Ethiopian National Curriculum (Ministry & EUEE Entrance)\n• Cambridge IGCSE, GCSE & International Curriculums\n• Mathematics, Physics, Chemistry & English language mastery\n\nEvery tutor is background-screened with national ID and academic credentials verified.\n\n👉 Request your private tutor in 2 minutes: {{TARGET_URL}}',
      default_caption_am:
        '🎓 ለልጅዎ የታመነ የግል አስጠኚ ይፈልጋሉ?\n\nብሩህ ተስፋ ብቁ እና ማንነታቸው የተረጋገጠ መምህራንን ያገናኝዎታል:\n• ለሀገር አቀፍ ፈተና (ሚኒስትሪ እና ማትሪክ)\n• ለአለም አቀፍ ትምህርት ስርዓት (Cambridge IGCSE)\n• ለሂሳብ፣ ፊዚክስ፣ ኬሚስትሪ እና እንግሊዝኛ\n\n👉 አስተማሪ ለመጠየቅ ይህንን ይጫኑ: {{TARGET_URL}}',
    },
    {
      id: 'tpl-05',
      key: 'how_it_works',
      title: 'E. How Bruh Tesfa Works',
      category: 'branding_educational',
      call_to_action: 'Learn More & Get Started',
      target_url_path: '/how-it-works',
      default_campaign: 'tg_how_it_works',
      default_caption_en:
        '💡 HOW BRUH TESFA WORKS (Step-by-Step)\n\n1️⃣ Submit Your Request: Tell us your child’s grade, subject, and sub-city.\n2️⃣ Intelligent Matching: We match you with vetted educators suited to your schedule and goals.\n3️⃣ Trial Lesson: Complete an introductory lesson with parent presence.\n4️⃣ Direct Progress: Continue lessons with structured milestones and transparent agreement.\n\nEthical, professional, and built for Addis Ababa families.\n\n👉 Learn more: {{TARGET_URL}}',
    },
    {
      id: 'tpl-06',
      key: 'referral_campaign',
      title: 'F. Referral Rewards Campaign',
      category: 'branding_educational',
      call_to_action: 'Refer an Educator',
      target_url_path: '/become-a-tutor',
      default_campaign: 'tg_referral_drive',
      default_caption_en:
        '🤝 KNOW AN EXCEPTIONAL TEACHER IN ADDIS ABABA?\n\nDo you know an outstanding educator, university top-ranker, or patient tutor? Refer them to BRUH TESFA!\n\nWe connect dedicated teachers with respectful families and fair compensation.\n\n👉 Share this registration link: {{TARGET_URL}}\n\nHelp us build Ethiopia\'s most trusted tutoring community!',
    },
    {
      id: 'tpl-07',
      key: 'study_tips',
      title: 'G. Educational Tips & Study Skills',
      category: 'branding_educational',
      call_to_action: 'Read Study Resources',
      target_url_path: '/about',
      default_campaign: 'tg_study_tips',
      default_caption_en:
        '📚 BRUH TESFA STUDY TIP: The SQ3R Method for Exam Mastery\n\nPassive re-reading of textbooks only creates the illusion of learning. Use SQ3R:\n\n1. Survey: Skim chapter headings & summaries.\n2. Question: Turn headings into quiz questions.\n3. Read: Read actively to answer those questions.\n4. Recite: Cover the page and recall key principles aloud.\n5. Review: Re-test yourself after 48 hours.\n\nOur STEM tutors incorporate active recall into every session.\n\n👉 Connect with an expert tutor: {{TARGET_URL}}',
    },
    {
      id: 'tpl-08',
      key: 'faqs',
      title: 'H. Frequently Asked Questions',
      category: 'branding_educational',
      call_to_action: 'Read FAQs',
      target_url_path: '/fee-policy',
      default_campaign: 'tg_faqs',
      default_caption_en:
        '❓ BRUH TESFA FREQUENTLY ASKED QUESTIONS\n\nQ: How are tutors vetted?\nA: Every tutor submits their Kebele ID, university degree/student ID, and passes a pedagogy review.\n\nQ: What are the placement fees?\nA: We charge a transparent one-time 60% placement commission on the first month only. Months 2 onwards have ZERO commission!\n\nQ: Can we replace a tutor if they are not a good fit?\nA: Yes! We provide a free replacement if either party cancels within the first 2 sessions.\n\n👉 Read our full fee policy: {{TARGET_URL}}',
    },
    {
      id: 'tpl-09',
      key: 'safeguarding_trust',
      title: 'I. Child Safeguarding & Safety Commitment',
      category: 'branding_educational',
      call_to_action: 'Review Safety Policy',
      target_url_path: '/safety',
      default_campaign: 'tg_safety_commitment',
      default_caption_en:
        '🛡 TRUST & SAFEGUARDING FIRST AT BRUH TESFA\n\nChild safety is non-negotiable:\n\n✔️ In-person tutoring must always occur with a parent or adult guardian present in the home (Proc. No. 1321/2024).\n✔️ Official ID verification for every educator.\n✔️ Signed Code of Conduct prohibiting private off-platform payments or unvetted locations.\n✔️ Active complaint resolution desk.\n\nYour child’s future and safety come first.\n\n👉 Review our safeguarding standards: {{TARGET_URL}}',
    },
    {
      id: 'tpl-10',
      key: 'success_stories',
      title: 'J. Verified Progress Milestones',
      category: 'branding_educational',
      call_to_action: 'Find a Tutor Today',
      target_url_path: '/request-tutor',
      default_campaign: 'tg_success_story',
      default_caption_en:
        '🌟 STUDENT PROGRESS HIGHLIGHT (Addis Ababa)\n\n"Within 3 months of working with Teacher Dagmawi on Grade 10 physics and algebra, our son went from scoring 58% to 88% on his midterm assessments. The patience and active recall exercises made all the difference."\n— Woizero Aster, Bole\n\nWe celebrate our dedicated tutors and hard-working students!\n\n👉 Request a verified educator: {{TARGET_URL}}',
    },
    {
      id: 'tpl-11',
      key: 'new_tutors_highlight',
      title: 'K. Welcome Newly Verified Tutors',
      category: 'tutor_recruitment',
      call_to_action: 'Meet Our Educators',
      target_url_path: '/tutors',
      default_campaign: 'tg_new_tutors',
      default_caption_en:
        '👏 WELCOME TO OUR NEWEST VERIFIED EDUCATORS!\n\nThis week, 8 new educators completed qualification checks and background screening in:\n• Advanced Mathematics & Calculus\n• University Entrance Physics & Chemistry\n• Cambridge International Primary & Secondary\n\nAvailable across Bole, Yeka, Kirkos, and online!\n\n👉 View verified tutor profiles: {{TARGET_URL}}',
    },
    {
      id: 'tpl-12',
      key: 'vacancy_deadline_update',
      title: 'L. Vacancy Deadline & Status Updates',
      category: 'vacancy',
      call_to_action: 'Apply Before Closing',
      target_url_path: '/vacancies',
      default_campaign: 'tg_urgent_vacancies',
      default_caption_en:
        '⏳ CLOSING SOON: TUTORING OPPORTUNITIES IN ADDIS ABABA\n\nApplications are closing this weekend for several high-priority tutoring placements in Bole and Yeka.\n\n• Pay: 400 - 550 ETB / hour\n• Immediate start dates\n• In-person & online formats\n\n👉 Review and submit your application before review cutoff: {{TARGET_URL}}',
    },
  ];
}

/**
 * Renders a specific Content Studio template with real parameters.
 */
export function renderContentStudioPost(
  templateKey: string,
  params: {
    vacancy?: TutoringVacancy;
    vacanciesList?: TutoringVacancy[];
    customBaseUrl?: string;
  }
): { caption: string; targetUrl: string; shareUrl: string } {
  const templates = getContentStudioTemplates();
  const tpl = templates.find((t) => t.key === templateKey) || templates[0];
  const baseUrl = (params.customBaseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://bruhtesfa.et').replace(/\/+$/, '');

  const targetUrl = generateTrackedLink(tpl.target_url_path, tpl.default_campaign, 'channel', 'telegram', baseUrl);

  let caption = tpl.default_caption_en;

  if (params.vacancy) {
    const v = params.vacancy;
    caption = caption
      .replace(/{{VACANCY_CODE}}/g, v.vacancy_code)
      .replace(/{{TITLE}}/g, v.title)
      .replace(/{{LOCATION}}/g, `${v.sub_city}${v.general_area ? ` (${v.general_area})` : ''}, Addis Ababa`)
      .replace(/{{GRADE}}/g, v.grade_level)
      .replace(/{{HOURLY_RATE}}/g, String(v.hourly_rate_etb))
      .replace(/{{SCHEDULE}}/g, `${v.lesson_frequency} • ${v.time_window || 'Afternoon'}`)
      .replace(/{{APPLY_URL}}/g, generateTrackedLink(`/vacancies/${v.vacancy_code}`, tpl.default_campaign, 'channel', 'telegram', baseUrl));
  }

  if (params.vacanciesList && params.vacanciesList.length > 0) {
    const listStr = params.vacanciesList
      .slice(0, 5)
      .map(
        (v, i) =>
          `📌 ${i + 1}. *${v.title}* (${v.vacancy_code})\n` +
          `   📍 ${v.sub_city} • 💰 ${v.hourly_rate_etb} ETB/hr • ⏱ ${v.hours_per_session} hrs/lesson\n` +
          `   🔗 [Apply Online](${generateTrackedLink(`/vacancies/${v.vacancy_code}`, 'weekly_roundup_item', 'channel', 'telegram', baseUrl)})`
      )
      .join('\n\n');
    caption = caption.replace(/{{VACANCY_LIST}}/g, listStr);
  } else {
    caption = caption.replace(/{{VACANCY_LIST}}/g, '• Multiple openings in Bole, Yeka, and Kirkos (400 - 550 ETB/hr)');
  }

  caption = caption.replace(/{{TARGET_URL}}/g, targetUrl);

  const shareText = encodeURIComponent(caption.slice(0, 250) + `...\n\nRead more: ${targetUrl}`);
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${shareText}`;

  return { caption, targetUrl, shareUrl };
}
