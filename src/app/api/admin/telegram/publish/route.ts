// =============================================================================
// BRUH TESFA - Admin Telegram Broadcast & Alert Dispatcher API
// (POST /api/admin/telegram/publish)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import {
  getAdminVacancies,
  hasVacancyBeenBroadcast,
} from '@/lib/db/storage';
import {
  publishVacancyToTelegramChannel,
  dispatchVacancyAlertsToSubscribers,
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { vacancyId, customCaption, dispatchSubscribers, forceRepublish } = body;

    if (!vacancyId) {
      return NextResponse.json({ success: false, error: 'vacancyId is required' }, { status: 400 });
    }

    const vacancies = await getAdminVacancies();
    const vacancy = vacancies.find((v) => v.id === vacancyId);

    if (!vacancy) {
      return NextResponse.json({ success: false, error: 'Vacancy not found' }, { status: 404 });
    }

    const channelId = process.env.TELEGRAM_CHANNEL_ID || '@bruhtesfa_announcements';

    // Idempotency check: prevent accidental double-posting to the channel
    if (!forceRepublish) {
      const alreadyBroadcast = await hasVacancyBeenBroadcast(vacancy.id, channelId);
      if (alreadyBroadcast) {
        return NextResponse.json({
          success: false,
          error: `This vacancy has already been published to ${channelId}. Set forceRepublish=true if you deliberately wish to post an update.`,
          alreadyPublished: true,
        }, { status: 409 });
      }
    }

    // 1. Publish to Channel
    const channelResult = await publishVacancyToTelegramChannel(vacancy, undefined, customCaption);

    // 2. Dispatch targeted alerts to opt-in subscribers (if requested)
    let alertResult = { notifiedCount: 0, errors: 0, skippedCount: 0 };
    if (dispatchSubscribers) {
      alertResult = await dispatchVacancyAlertsToSubscribers(vacancy);
    }

    return NextResponse.json({
      success: channelResult.success,
      channelResult,
      alertResult,
    });
  } catch (error) {
    console.error('Error during Telegram broadcast:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
