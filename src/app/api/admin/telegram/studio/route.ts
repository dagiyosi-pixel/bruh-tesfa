// =============================================================================
// BRUH TESFA - Admin Telegram Content Studio API
// (GET, POST /api/admin/telegram/studio)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getAdminVacancies, getTelegramMarketingMetrics, getTelegramBroadcastLogs } from '@/lib/db/storage';
import { getContentStudioTemplates, renderContentStudioPost } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const templates = getContentStudioTemplates();
  const vacancies = await getAdminVacancies();
  const openVacancies = vacancies.filter((v) => v.status === 'open' || v.status === 'closing_soon');
  const metrics = await getTelegramMarketingMetrics();
  const recentLogs = (await getTelegramBroadcastLogs()).slice(0, 10);

  return NextResponse.json({
    success: true,
    templates,
    openVacancies,
    metrics,
    recentLogs,
    isBotConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID),
    channelId: process.env.TELEGRAM_CHANNEL_ID || '@bruhtesfa_announcements',
  });
}

export async function POST(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { templateKey, vacancyId } = body;

    const vacancies = await getAdminVacancies();
    const vacancy = vacancyId ? vacancies.find((v) => v.id === vacancyId) : undefined;
    const openVacancies = vacancies.filter((v) => v.status === 'open' || v.status === 'closing_soon');

    const rendered = renderContentStudioPost(templateKey || 'vacancy_announcement', {
      vacancy,
      vacanciesList: openVacancies,
    });

    return NextResponse.json({
      success: true,
      ...rendered,
    });
  } catch (error) {
    console.error('Error rendering Content Studio template:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
