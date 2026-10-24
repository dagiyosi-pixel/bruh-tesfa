// =============================================================================
// BRUH TESFA - Administrator Metrics API (GET /api/admin/metrics)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getAdminMetrics } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const metrics = await getAdminMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
