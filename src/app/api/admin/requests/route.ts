// =============================================================================
// BRUH TESFA - Administrator Parent Requests API (GET, PATCH /api/admin/requests)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getAdminParentRequests, updateParentRequestStatus } from '@/lib/db/storage';
import { ParentRequestStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requests = await getAdminParentRequests();
    return NextResponse.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('Error fetching parent requests:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, adminNotes } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const validStatuses: ParentRequestStatus[] = [
      'new',
      'reviewing',
      'matching',
      'candidates_proposed',
      'matched',
      'active',
      'closed',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid request status' }, { status: 400 });
    }

    const updated = await updateParentRequestStatus(id, status, adminNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Parent request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error('Error updating parent request status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
