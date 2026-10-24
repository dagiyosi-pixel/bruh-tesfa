// =============================================================================
// BRUH TESFA - Public Vacancies Board API (GET /api/vacancies)
// Only returns open, closing_soon, or filled vacancies. Never sensitive parent data.
// =============================================================================

import { NextResponse } from 'next/server';
import { getPublicVacancies } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subCity = searchParams.get('subCity') || undefined;
    const grade = searchParams.get('grade') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const modality = searchParams.get('modality') || undefined;
    const minRate = searchParams.get('minRate') ? Number(searchParams.get('minRate')) : undefined;
    const search = searchParams.get('search') || undefined;

    const vacancies = await getPublicVacancies({ subCity, grade, subject, modality, minRate, search });
    return NextResponse.json({ success: true, count: vacancies.length, vacancies });
  } catch (error) {
    console.error('Error fetching public vacancies:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
