// =============================================================================
// BRUH TESFA - Tutor Portal Application Status Endpoint
// Allows applicants to securely check their application status using their
// unique application reference number (e.g. BT-TUT-2026-0001) and phone.
// =============================================================================

import { NextResponse } from 'next/server';
import { lookupTutorPortalStatus } from '@/lib/db/storage';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`${ip}:tutor-portal-status`, 10, 15 * 60 * 1000); // 10 attempts / 15 mins
  if (!rateLimit.isAllowed) {
    return NextResponse.json(
      { success: false, error: 'Too many status check attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.resetInSeconds) },
      }
    );
  }

  try {
    const { referenceNumber, phone } = await request.json();
    if (!referenceNumber || !phone) {
      return NextResponse.json(
        { success: false, error: 'Please enter both your Application Reference Number and registered phone number.' },
        { status: 400 }
      );
    }

    const result = await lookupTutorPortalStatus(referenceNumber, phone);
    if (!result.success || !result.tutor) {
      return NextResponse.json(
        { success: false, error: result.error || 'No matching application found. Please verify your reference number and phone.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tutor: result.tutor });
  } catch (error) {
    console.error('Error looking up tutor portal status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
