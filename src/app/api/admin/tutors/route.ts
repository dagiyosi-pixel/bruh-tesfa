// =============================================================================
// BRUH TESFA - Administrator Tutors Management API (GET, PATCH /api/admin/tutors)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getAdminTutorApplications, updateTutorApplicationStatus } from '@/lib/db/storage';
import { ApplicationStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const applications = await getAdminTutorApplications();
    return NextResponse.json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error('Error fetching admin tutor applications:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, adminReviewNotes, reviewedBy } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const validStatuses: ApplicationStatus[] = ['submitted', 'under_review', 'needs_info', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid application status' }, { status: 400 });
    }

    const updated = await updateTutorApplicationStatus(id, status, adminReviewNotes, reviewedBy || 'Staff Admin');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Tutor application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tutor: updated });
  } catch (error) {
    console.error('Error updating tutor application status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
