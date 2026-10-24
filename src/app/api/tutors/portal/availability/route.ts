// =============================================================================
// BRUH TESFA - Tutor Portal Schedule Self-Service Endpoint
// Allows verified or approved tutors to update their weekly availability
// and blackout dates securely using reference number and phone authentication.
// =============================================================================

import { NextResponse } from 'next/server';
import { lookupTutorPortalStatus, updateTutorAvailability } from '@/lib/db/storage';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`${ip}:tutor-portal-availability`, 15, 15 * 60 * 1000);
  if (!rateLimit.isAllowed) {
    return NextResponse.json(
      { success: false, error: 'Too many schedule update attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.resetInSeconds) },
      }
    );
  }

  try {
    const { referenceNumber, phone, weeklyAvailability, blackoutDates } = await request.json();

    if (!referenceNumber || !phone || !weeklyAvailability) {
      return NextResponse.json(
        { success: false, error: 'Reference number, phone, and weekly schedule are required.' },
        { status: 400 }
      );
    }

    const authCheck = await lookupTutorPortalStatus(referenceNumber, phone);
    if (!authCheck.success || !authCheck.tutor) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed. Please verify your reference number and phone.' },
        { status: 401 }
      );
    }

    const result = await updateTutorAvailability(authCheck.tutor.id, weeklyAvailability, blackoutDates);

    return NextResponse.json({
      success: true,
      message: 'Your weekly teaching availability has been updated successfully.',
      tutor: {
        id: result.tutor.id,
        reference_number: result.tutor.reference_number,
        public_display_name: result.tutor.public_display_name,
        weekly_availability: result.tutor.weekly_availability,
        available_days: result.tutor.available_days,
        blackout_dates: result.tutor.blackout_dates,
        updated_at: result.tutor.updated_at,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error updating tutor availability via portal:', error);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
