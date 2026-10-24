// =============================================================================
// BRUH TESFA - Admin Complaints Management API (GET, PATCH /api/admin/complaints)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getAdminComplaints, resolveComplaint } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const complaints = await getAdminComplaints();
    return NextResponse.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, resolutionNotes, status, resolvedBy } = await request.json();

    if (!id || !resolutionNotes) {
      return NextResponse.json({ success: false, error: 'id and resolutionNotes are required' }, { status: 400 });
    }

    const updated = await resolveComplaint(id, resolutionNotes, status || 'resolved', resolvedBy || 'Staff Admin');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, complaint: updated });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
