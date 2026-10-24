// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Tutor Logout API
// Explicitly invalidates the tutor session cookie.
// =============================================================================

import { NextResponse } from 'next/server';
import { TUTOR_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set(TUTOR_COOKIE_NAME, '', {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}
