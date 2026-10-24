// =============================================================================
// BRUH TESFA - Administrator Login API (POST /api/admin/login)
// Hardened with Brute-Force Rate Limiting and Constant-Time Verification
// =============================================================================

import { NextResponse } from 'next/server';
import { validateAdminCredentials, createAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes

    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed administrator login attempts. Please retry after ${rateLimit.resetInSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.resetInSeconds) },
        }
      );
    }

    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const isValid = validateAdminCredentials(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid administrator credentials. Access attempt logged.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const response = NextResponse.json({
      success: true,
      message: 'Administrator session established successfully',
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
