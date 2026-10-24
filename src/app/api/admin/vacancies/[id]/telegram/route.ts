// =============================================================================
// BRUH TESFA - Vacancy Telegram Distribution API
// (GET, POST /api/admin/vacancies/[id]/telegram)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getAdminVacancies, recordTelegramBroadcast } from '@/lib/db/storage';
import { generateTelegramVacancyAnnouncement, publishVacancyToTelegramChannel } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const vacancies = await getAdminVacancies();
    const vacancy = vacancies.find((v) => v.id === id);

    if (!vacancy) {
      return NextResponse.json({ success: false, error: 'Vacancy not found' }, { status: 404 });
    }

    const text = generateTelegramVacancyAnnouncement(vacancy);
    return NextResponse.json({
      success: true,
      vacancyCode: vacancy.vacancy_code,
      announcementText: text,
      isConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID),
    });
  } catch (error) {
    console.error('Error generating Telegram announcement:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const vacancies = await getAdminVacancies();
    const vacancy = vacancies.find((v) => v.id === id);

    if (!vacancy) {
      return NextResponse.json({ success: false, error: 'Vacancy not found' }, { status: 404 });
    }

    const result = await publishVacancyToTelegramChannel(vacancy);

    if (result.success && result.messageId) {
      await recordTelegramBroadcast(vacancy.id, result.messageId);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error dispatching to Telegram channel:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
