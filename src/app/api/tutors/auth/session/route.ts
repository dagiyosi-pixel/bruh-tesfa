// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Tutor Session Restoration API
// Reads signed HttpOnly session cookie, validates cryptographically,
// and returns the tutor's live profile, schedule, and submitted vacancy applications.
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyTutorSession } from '@/lib/auth';
import { getTutorById, getTutorVacancyApplications } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await verifyTutorSession();
    if (!session.isAuthenticated || !session.tutorId) {
      return NextResponse.json({ authenticated: false });
    }

    const tutor = await getTutorById(session.tutorId);
    if (!tutor) {
      return NextResponse.json({ authenticated: false, error: 'Tutor account record not found' });
    }

    const applications = await getTutorVacancyApplications(tutor.id, tutor.phone);

    return NextResponse.json({
      authenticated: true,
      tutor: {
        id: tutor.id,
        reference_number: tutor.reference_number,
        public_display_name: tutor.public_display_name,
        email: tutor.email,
        phone: tutor.phone,
        status: tutor.status,
        subjects: tutor.subjects,
        grade_levels: tutor.grade_levels,
        curricula: tutor.curricula,
        teaching_modes: tutor.teaching_modes,
        travel_areas: tutor.travel_areas,
        hourly_rate_etb: tutor.hourly_rate_etb,
        weekly_availability: tutor.weekly_availability,
        blackout_dates: tutor.blackout_dates,
        availability_confirmed_at: tutor.availability_confirmed_at,
        created_at: tutor.created_at,
        has_password: Boolean(tutor.password_hash),
      },
      applications: applications.map((app) => ({
        id: app.id,
        vacancy_id: app.vacancy_id,
        applicant_name: app.applicant_name,
        proposed_rate_etb: app.proposed_rate_etb,
        status: app.status,
        created_at: app.created_at,
      })),
    });
  } catch (error) {
    console.error('Error verifying tutor session:', error);
    return NextResponse.json({ authenticated: false, error: 'Internal server error' }, { status: 500 });
  }
}
