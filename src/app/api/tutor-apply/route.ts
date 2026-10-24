// =============================================================================
// BRUH TESFA - Tutor Application Submission (POST /api/tutor-apply)
// Hardened with IP Rate Limiting, Input Sanitization & Proclamation 1321/2024
// =============================================================================

import { NextResponse } from 'next/server';
import { submitTutorApplication } from '@/lib/db/storage';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { createTutorSessionToken, TUTOR_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`tutor-apply:${ip}`, 10, 60 * 60 * 1000); // 10 applications per hour
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please wait before submitting another tutor application.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.resetInSeconds) } }
      );
    }

    const body = await request.json();

    // 1. Validation checks
    const {
      full_legal_name,
      public_display_name,
      phone,
      email,
      preferred_contact_channel,
      city,
      sub_city,
      specific_neighborhood,
      subjects,
      grade_levels,
      curricula,
      education_level,
      institution,
      field_of_study,
      years_of_experience,
      teaching_approach,
      bio,
      teaching_languages,
      available_days,
      available_time_windows,
      teaching_modes,
      travel_areas,
      hourly_rate_etb,
      national_id_doc_path,
      degree_cert_doc_path,
      privacy_consent,
      code_of_conduct_agreed,
      referral_source,
      utm_source,
      utm_campaign,
    } = body;

    if (!full_legal_name || full_legal_name.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Full legal name is required for verification records' }, { status: 400 });
    }

    if (!public_display_name || public_display_name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Public display name is required' }, { status: 400 });
    }

    if (!phone || phone.trim().length < 9) {
      return NextResponse.json({ success: false, error: 'A valid telephone number is required' }, { status: 400 });
    }

    if (!sub_city) {
      return NextResponse.json({ success: false, error: 'Please specify your Addis Ababa sub-city' }, { status: 400 });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ success: false, error: 'Please select at least one teaching subject' }, { status: 400 });
    }

    if (!Array.isArray(grade_levels) || grade_levels.length === 0) {
      return NextResponse.json({ success: false, error: 'Please select at least one target grade level' }, { status: 400 });
    }

    if (!education_level || !institution) {
      return NextResponse.json({ success: false, error: 'Education qualification and institution are required' }, { status: 400 });
    }

    if (!teaching_approach || teaching_approach.trim().length < 20) {
      return NextResponse.json({ success: false, error: 'Please provide a clear description of your teaching methodology' }, { status: 400 });
    }

    if (!privacy_consent) {
      return NextResponse.json(
        { success: false, error: 'Consent to the Privacy Notice under Ethiopian Proclamation No. 1321/2024 is required' },
        { status: 400 }
      );
    }

    if (!code_of_conduct_agreed) {
      return NextResponse.json(
        { success: false, error: 'You must agree to the Tutor Code of Conduct and Safeguarding Guidelines' },
        { status: 400 }
      );
    }

    // 2. Persist to real database (in 'submitted' status)
    const result = await submitTutorApplication({
      full_legal_name: full_legal_name.trim(),
      public_display_name: public_display_name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      preferred_contact_channel: preferred_contact_channel || 'Telegram',
      city: city || 'Addis Ababa',
      sub_city: sub_city.trim(),
      specific_neighborhood: specific_neighborhood?.trim() || '',
      subjects,
      grade_levels,
      curricula: Array.isArray(curricula) && curricula.length > 0 ? curricula : ['Ethiopian National Curriculum'],
      education_level: education_level.trim(),
      institution: institution.trim(),
      field_of_study: field_of_study?.trim() || '',
      years_of_experience: Number(years_of_experience) || 0,
      teaching_approach: teaching_approach.trim(),
      bio: bio?.trim() || teaching_approach.trim().slice(0, 160),
      teaching_languages: Array.isArray(teaching_languages) && teaching_languages.length > 0 ? teaching_languages : ['English', 'Amharic (አማርኛ)'],
      available_days: Array.isArray(available_days) ? available_days : [],
      available_time_windows: Array.isArray(available_time_windows) ? available_time_windows : [],
      teaching_modes: Array.isArray(teaching_modes) && teaching_modes.length > 0 ? teaching_modes : ['in_person'],
      travel_areas: Array.isArray(travel_areas) ? travel_areas : [sub_city],
      hourly_rate_etb: Number(hourly_rate_etb) || 350,
      national_id_doc_path,
      degree_cert_doc_path,
      avatar_url: body.avatar_url || '',
      privacy_consent: Boolean(privacy_consent),
      code_of_conduct_agreed: Boolean(code_of_conduct_agreed),
      referral_source: referral_source || 'Website Application',
      utm_source: utm_source || undefined,
      utm_campaign: utm_campaign || undefined,
    });

    const sessionToken = createTutorSessionToken(result.id, phone.trim());
    const response = NextResponse.json({
      success: true,
      reference_number: result.reference_number,
      id: result.id,
      message: 'Application submitted successfully. A Bruh Tesfa coordinator will review your credentials within 24-48 business hours.',
    });
    response.cookies.set(TUTOR_COOKIE_NAME, sessionToken, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error('Error submitting tutor application:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
