// =============================================================================
// BRUH TESFA - Data Protection & Deletion API (POST /api/privacy-request)
// Ethiopian Personal Data Protection Proclamation No. 1321/2024
// =============================================================================

import { NextResponse } from 'next/server';
import { submitDataDeletionRequest } from '@/lib/db/storage';

export async function POST(request: Request) {
  try {
    const { requester_name, requester_contact, request_type, details } = await request.json();

    if (!requester_name || !requester_contact) {
      return NextResponse.json({ success: false, error: 'Name and contact information are required' }, { status: 400 });
    }

    const result = await submitDataDeletionRequest({
      requester_name: requester_name.trim(),
      requester_contact: requester_contact.trim(),
      request_type: request_type || 'deletion',
      details: details?.trim() || undefined,
    });

    return NextResponse.json({
      success: true,
      reference_number: result.reference_number,
      message: 'Your data privacy request has been recorded. In accordance with Proclamation No. 1321/2024, our Data Protection Officer will verify identity and fulfill the request within 30 days.',
    });
  } catch (error) {
    console.error('Error submitting privacy request:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
