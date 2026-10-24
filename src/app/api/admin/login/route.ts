// =============================================================================
// BRUH TESFA - Administrator Login API (POST /api/admin/login)
// =============================================================================

import { NextResponse } from 'next/server';
import { validateAdminCredentials, createAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const isValid = validateAdminCredentials(password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid administrator credentials' }, { status: 401 });
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
