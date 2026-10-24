// =============================================================================
// BRUH TESFA - Matches Management API (GET, POST /api/admin/matches)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getAdminMatches, proposeCandidateMatch } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const matches = await getAdminMatches();
    return NextResponse.json({ success: true, count: matches.length, matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { requestId, tutorId, matchScore, notes } = await request.json();

    if (!requestId || !tutorId) {
      return NextResponse.json({ success: false, error: 'requestId and tutorId are required' }, { status: 400 });
    }

    const match = await proposeCandidateMatch(requestId, tutorId, matchScore, notes);
    if (!match) {
      return NextResponse.json({ success: false, error: 'Failed to propose match. Request or Tutor not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, match });
  } catch (error) {
    console.error('Error proposing candidate match:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
