// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Telegram Announcement & Distribution System
// =============================================================================
// 1. Copy-ready announcement generator (Works 100% offline without API token)
// 2. Optional Telegram Bot API integration (Active only when credentials exist)

import { TutoringVacancy } from './types';

/**
 * Generates an attractive, high-converting Telegram channel broadcast text
 * formatted specifically for Ethiopian tutoring communities.
 */
export function generateTelegramVacancyAnnouncement(
  vacancy: TutoringVacancy,
  customBaseUrl?: string
): string {
  const baseUrl = customBaseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://bruhtesfa.et';
  const applyUrl = `${baseUrl}/vacancies/${vacancy.vacancy_code}?utm_source=telegram&utm_campaign=vacancy_alert`;

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
    `Telegram Community: https://t.me/bruhtesfa_community`,
  ].join('\n');
}

/**
 * Optional Telegram Bot API Integration.
 * Only attempts network dispatch if both TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID are configured.
 */
export async function publishVacancyToTelegramChannel(
  vacancy: TutoringVacancy,
  customBaseUrl?: string
): Promise<{ success: boolean; messageId?: string; error?: string; simulated?: boolean }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID; // e.g. @bruhtesfa_announcements or -100xxxxxxxx

  if (!botToken || !channelId) {
    return {
      success: false,
      error:
        'Telegram bot credentials not configured in environment variables (TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID). Use manual copy-paste mode.',
      simulated: true,
    };
  }

  const messageText = generateTelegramVacancyAnnouncement(vacancy, customBaseUrl);

  try {
    const telegramEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
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

    return {
      success: true,
      messageId: String(data.result?.message_id),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error during Telegram dispatch';
    return { success: false, error: msg };
  }
}
