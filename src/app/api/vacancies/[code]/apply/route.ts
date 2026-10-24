// =============================================================================
// BRUH TESFA - Apply to Vacancy API (POST /api/vacancies/[code]/apply)
// =============================================================================

import { NextResponse } from 'next/server';
import { getPublicVacancyByCode, submitVacancyApplication } from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const body = await request.json();

    const {
      tutor_id,
      applicant_name,
      applicant_phone,
      applicant_email,
      applicant_education,
      applicant_institution,
      years_of_experience,
      proposed_rate_etb,
      available_schedule,
      cover_note,
      referral_source,
      utm_source,
      utm_campaign,
    } = body;

    const vacancy = await getPublicVacancyByCode(code, false);
    if (!vacancy) {
      return NextResponse.json({ success: false, error: 'Vacancy not found' }, { status: 404 });
    }

    if (vacancy.status !== 'open' && vacancy.status !== 'closing_soon') {
      return NextResponse.json(
        { success: false, error: `This vacancy is currently ${vacancy.status} and cannot receive new applications.` },
        { status: 400 }
      );
    }

    if (!applicant_name || applicant_name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Full applicant name is required' }, { status: 400 });
    }

    if (!applicant_phone || applicant_phone.trim().length < 9) {
      return NextResponse.json({ success: false, error: 'A valid telephone number is required' }, { status: 400 });
    }

    if (!applicant_education || !applicant_institution) {
      return NextResponse.json({ success: false, error: 'Education qualification and institution are required' }, { status: 400 });
    }

    if (!cover_note || cover_note.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'Please provide a brief statement of your teaching approach (minimum 20 characters)' },
        { status: 400 }
      );
    }

    const result = await submitVacancyApplication({
      vacancy_id: vacancy.id,
      tutor_id: tutor_id || undefined,
      applicant_name: applicant_name.trim(),
      applicant_phone: applicant_phone.trim(),
      applicant_email: applicant_email ? applicant_email.trim() : undefined,
      applicant_education: applicant_education.trim(),
      applicant_institution: applicant_institution.trim(),
      years_of_experience: Number(years_of_experience) || 0,
      proposed_rate_etb: proposed_rate_etb ? Number(proposed_rate_etb) : undefined,
      available_schedule: available_schedule?.trim() || undefined,
      cover_note: cover_note.trim(),
      referral_source: referral_source || 'Vacancy Board',
      utm_source: utm_source || undefined,
      utm_campaign: utm_campaign || undefined,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      vacancy_code: vacancy.vacancy_code,
      message: 'Your application for this tutoring vacancy has been received. Our coordination team will review your qualifications and contact shortlisted candidates for an introduction.',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
