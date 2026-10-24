// =============================================================================
// BRUH TESFA - Single Public Vacancy API (GET /api/vacancies/[code])
// =============================================================================

import { NextResponse } from 'next/server';
import { getPublicVacancyByCode } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    if (!code) {
      return NextResponse.json({ success: false, error: 'Vacancy code is required' }, { status: 400 });
    }

    const vacancy = await getPublicVacancyByCode(code, true);
    if (!vacancy) {
      return NextResponse.json({ success: false, error: 'Vacancy not found' }, { status: 404 });
    }

    // Never show draft or archived vacancies publicly
    if (vacancy.status === 'draft' || vacancy.status === 'archived') {
      return NextResponse.json({ success: false, error: 'Vacancy is not publicly accessible' }, { status: 404 });
    }

    return NextResponse.json({ success: true, vacancy });
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
