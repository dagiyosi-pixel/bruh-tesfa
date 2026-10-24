// =============================================================================
// BRUH TESFA - Admin Vacancy Applications Management API
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getVacancyApplications, updateVacancyApplicationStatus } from '@/lib/db/storage';
import { VacancyApplicationStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const applications = await getVacancyApplications(id);
    return NextResponse.json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error('Error fetching vacancy applications:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { applicationId, status, adminReviewNotes } = await request.json();

    if (!applicationId || !status) {
      return NextResponse.json({ success: false, error: 'applicationId and status are required' }, { status: 400 });
    }

    const updated = await updateVacancyApplicationStatus(
      applicationId,
      status as VacancyApplicationStatus,
      adminReviewNotes
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Error updating vacancy application status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
