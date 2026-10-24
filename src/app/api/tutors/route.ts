// =============================================================================
// BRUH TESFA - Public Tutors API (GET /api/tutors)
// Only returns verified, approved public profiles. Never private details.
// =============================================================================

import { NextResponse } from 'next/server';
import { getPublicTutors } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;
    const grade = searchParams.get('grade') || undefined;
    const modality = searchParams.get('modality') || undefined;
    const subCity = searchParams.get('subCity') || undefined;
    const search = searchParams.get('search') || undefined;

    const tutors = await getPublicTutors({ subject, grade, modality, subCity, search });
    return NextResponse.json({ success: true, count: tutors.length, tutors });
  } catch (error) {
    console.error('Error fetching public tutors:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
