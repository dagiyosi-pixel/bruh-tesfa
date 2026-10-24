// =============================================================================
// BRUH TESFA - Fee Settings API (GET, POST /api/admin/fee-config)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getFeeConfig, updateFeeConfig } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getFeeConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching fee configuration:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { default_commission_percentage, failure_replacement_policy, repeat_client_policy } = await request.json();

    if (default_commission_percentage === undefined || isNaN(Number(default_commission_percentage))) {
      return NextResponse.json({ success: false, error: 'Valid commission percentage is required' }, { status: 400 });
    }

    const updated = await updateFeeConfig(
      Number(default_commission_percentage),
      failure_replacement_policy,
      repeat_client_policy
    );

    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    console.error('Error updating fee configuration:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
