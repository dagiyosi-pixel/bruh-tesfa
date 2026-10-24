// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Tutor Set Password API
// Allows an authenticated tutor to set or change their password.
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyTutorSession, hashPassword } from '@/lib/auth';
import { setTutorPassword } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await verifyTutorSession();
    if (!session.isAuthenticated || !session.tutorId) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in to update your password.' }, { status: 401 });
    }

    const { newPassword } = await request.json();
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(newPassword);
    const result = await setTutorPassword(session.tutorId, passwordHash);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating tutor password:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
