// =============================================================================
// BRUH TESFA - Convert Parent Request to Vacancy (POST /api/admin/vacancies/convert-request)
// Sanitizes parent request and creates a moderated vacancy draft
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { convertParentRequestToVacancy } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 });
    }

    const vacancy = await convertParentRequestToVacancy(requestId);
    if (!vacancy) {
      return NextResponse.json({ success: false, error: 'Parent request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      vacancy,
      message: `Parent request successfully converted to Vacancy draft ${vacancy.vacancy_code}. Sensitive parent details were removed.`,
    });
  } catch (error) {
    console.error('Error converting parent request to vacancy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
