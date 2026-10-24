// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Tutor Authentication & Login API
// Sets cryptographically signed HttpOnly session cookie on successful auth.
// =============================================================================

import { NextResponse } from 'next/server';
import { authenticateTutor } from '@/lib/db/storage';
import { createTutorSessionToken, TUTOR_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`${ip}:tutor-login`, 10, 15 * 60 * 1000); // 10 attempts per 15 min
  if (!rateLimit.isAllowed) {
    return NextResponse.json(
      { success: false, error: 'Too many sign-in attempts. Please wait a few minutes before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.resetInSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const { identifier, secret, rememberMe } = body;

    if (!identifier || !secret) {
      return NextResponse.json(
        { success: false, error: 'Please enter your registered phone/email/reference and your password.' },
        { status: 400 }
      );
    }

    const authResult = await authenticateTutor(identifier, secret);
    if (!authResult.success || !authResult.tutor) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Invalid credentials. Please verify your reference number, phone, or password.' },
        { status: 401 }
      );
    }

    const tutor = authResult.tutor;
    const sessionToken = createTutorSessionToken(tutor.id, tutor.phone);

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : AUTH_COOKIE_OPTIONS.maxAge; // 30 days if remember me

    const response = NextResponse.json({
      success: true,
      tutor: {
        id: tutor.id,
        reference_number: tutor.reference_number,
        public_display_name: tutor.public_display_name,
        email: tutor.email,
        phone: tutor.phone,
        status: tutor.status,
        subjects: tutor.subjects,
        grade_levels: tutor.grade_levels,
        curricula: tutor.curricula,
        teaching_modes: tutor.teaching_modes,
        travel_areas: tutor.travel_areas,
        hourly_rate_etb: tutor.hourly_rate_etb,
        weekly_availability: tutor.weekly_availability,
        blackout_dates: tutor.blackout_dates,
        availability_confirmed_at: tutor.availability_confirmed_at,
        created_at: tutor.created_at,
        has_password: Boolean(tutor.password_hash),
      },
    });

    response.cookies.set(TUTOR_COOKIE_NAME, sessionToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('Error during tutor login:', error);
    return NextResponse.json({ success: false, error: 'Internal server error during authentication' }, { status: 500 });
  }
}
