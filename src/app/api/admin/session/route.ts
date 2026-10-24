// =============================================================================
// BRUH TESFA - Check Administrator Session API (GET /api/admin/session)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  return NextResponse.json({
    authenticated: session.isAuthenticated,
    role: session.role || null,
  });
}
