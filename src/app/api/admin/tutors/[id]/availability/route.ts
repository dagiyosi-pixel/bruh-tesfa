// =============================================================================
// BRUH TESFA - Admin Tutor Availability Management Endpoint
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import {
  getTutorAvailability,
  updateTutorAvailability,
  confirmTutorAvailability,
} from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const availability = await getTutorAvailability(id);
    if (!availability) {
      return NextResponse.json({ success: false, error: 'Tutor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, availability });
  } catch (error) {
    console.error('Error fetching tutor availability:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action, weeklyAvailability, blackoutDates, notes } = body;

    if (action === 'confirm') {
      const tutor = await confirmTutorAvailability(id, notes, 'Staff Admin');
      return NextResponse.json({
        success: true,
        message: 'Tutor availability confirmed by coordinator',
        tutor,
      });
    }

    if (action === 'update' && weeklyAvailability) {
      const result = await updateTutorAvailability(id, weeklyAvailability, blackoutDates);
      return NextResponse.json({
        success: true,
        message: 'Tutor availability updated successfully',
        tutor: result.tutor,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error updating tutor availability:', error);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
