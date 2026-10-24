// =============================================================================
// BRUH TESFA - Placements & Fee Records API (GET, POST, PATCH /api/admin/placements)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getAdminPlacements, createPlacementRecord, updatePlacementPayment } from '@/lib/db/storage';
import { PaymentStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const placements = await getAdminPlacements();
    return NextResponse.json({ success: true, count: placements.length, placements });
  } catch (error) {
    console.error('Error fetching placements:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { matchId, agreedHourlyRateETB, contractType, lessonsPerWeek, hoursPerLesson, totalPackageHours, startDate } = body;

    if (!matchId || !agreedHourlyRateETB || !startDate) {
      return NextResponse.json({ success: false, error: 'matchId, agreedHourlyRateETB, and startDate are required' }, { status: 400 });
    }

    const placement = await createPlacementRecord({
      matchId,
      agreedHourlyRateETB: Number(agreedHourlyRateETB),
      contractType: contractType || 'first_month_recurring',
      lessonsPerWeek: lessonsPerWeek ? Number(lessonsPerWeek) : undefined,
      hoursPerLesson: hoursPerLesson ? Number(hoursPerLesson) : undefined,
      totalPackageHours: totalPackageHours ? Number(totalPackageHours) : undefined,
      startDate,
    });

    if (!placement) {
      return NextResponse.json({ success: false, error: 'Failed to create placement. Check match validity.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, placement });
  } catch (error) {
    console.error('Error creating placement:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, paymentStatus, paymentMethod, paymentReference, followUpStatus, followUpNotes } = body;

    if (!id || !paymentStatus) {
      return NextResponse.json({ success: false, error: 'Placement id and paymentStatus are required' }, { status: 400 });
    }

    const updated = await updatePlacementPayment(
      id,
      paymentStatus as PaymentStatus,
      paymentMethod,
      paymentReference,
      followUpStatus,
      followUpNotes
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Placement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, placement: updated });
  } catch (error) {
    console.error('Error updating placement payment:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
