// =============================================================================
// BRUH TESFA - Candidate Match Scoring API (GET /api/admin/candidates?requestId=...)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getMatchingCandidatesForRequest } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId parameter is required' }, { status: 400 });
    }

    const matches = await getMatchingCandidatesForRequest(requestId);
    return NextResponse.json({ success: true, count: matches.length, matches });
  } catch (error) {
    console.error('Error calculating candidate matches:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
