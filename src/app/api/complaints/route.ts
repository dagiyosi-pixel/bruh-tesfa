// =============================================================================
// BRUH TESFA - Public Incident & Complaints Reporting API (POST /api/complaints)
// =============================================================================

import { NextResponse } from 'next/server';
import { submitComplaint } from '@/lib/db/storage';
import { ComplaintPriority } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reporter_type, reporter_name, reporter_contact, subject, description, priority } = body;

    if (!subject || !description) {
      return NextResponse.json({ success: false, error: 'Subject and description are required' }, { status: 400 });
    }

    const result = await submitComplaint({
      reporter_type: reporter_type || 'parent',
      reporter_name: reporter_name?.trim() || undefined,
      reporter_contact: reporter_contact?.trim() || undefined,
      subject: subject.trim(),
      description: description.trim(),
      priority: (priority as ComplaintPriority) || 'medium',
    });

    return NextResponse.json({
      success: true,
      reference_number: result.reference_number,
      message: 'Your report has been logged confidentially with Bruh Tesfa Safeguarding. Our team will review and act immediately.',
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
