// =============================================================================
// BRUH TESFA - Single Public Tutor Profile API (GET /api/tutors/[slug])
// =============================================================================

import { NextResponse } from 'next/server';
import { getPublicTutorBySlug } from '@/lib/db/storage';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
    }

    const tutor = await getPublicTutorBySlug(slug);
    if (!tutor) {
      return NextResponse.json({ success: false, error: 'Tutor profile not found or not approved' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tutor });
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
