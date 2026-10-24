// =============================================================================
// BRUH TESFA - Parent / Guardian Tutoring Request API (POST /api/request-tutor)
// Hardened with IP Rate Limiting & Safe Field Validation
// =============================================================================

import { NextResponse } from 'next/server';
import { submitParentRequest } from '@/lib/db/storage';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`parent-request:${ip}`, 10, 60 * 60 * 1000); // 10 requests per hour
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests submitted. Please wait before submitting another tutoring request.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.resetInSeconds) } }
      );
    }

    const body = await request.json();

    const {
      parent_name,
      phone,
      email,
      preferred_contact_method,
      city,
      sub_city,
      general_area,
      target_tutor_id,
      subjects,
      grade_level,
      curriculum,
      teaching_mode,
      schedule_preference,
      lesson_frequency,
      budget_range_min,
      budget_range_max,
      preferred_language,
      learning_goals,
      privacy_consent,
      referral_source,
      utm_source,
      utm_campaign,
    } = body;

    if (!parent_name || parent_name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Parent or guardian name is required' }, { status: 400 });
    }

    if (!phone || phone.trim().length < 9) {
      return NextResponse.json({ success: false, error: 'A valid telephone number is required for follow-up' }, { status: 400 });
    }

    if (!sub_city) {
      return NextResponse.json({ success: false, error: 'Please select your sub-city in Addis Ababa' }, { status: 400 });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ success: false, error: 'Please specify the subject(s) needed' }, { status: 400 });
    }

    if (!grade_level) {
      return NextResponse.json({ success: false, error: 'Grade level is required' }, { status: 400 });
    }

    if (!privacy_consent) {
      return NextResponse.json(
        { success: false, error: 'Consent to contact and the Privacy Notice is required to process your request' },
        { status: 400 }
      );
    }

    const result = await submitParentRequest({
      parent_name: parent_name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      preferred_contact_method: preferred_contact_method || 'Phone',
      city: city || 'Addis Ababa',
      sub_city: sub_city.trim(),
      general_area: general_area?.trim() || undefined,
      target_tutor_id: target_tutor_id || undefined,
      subjects,
      grade_level: grade_level.trim(),
      curriculum: curriculum || 'Ethiopian National Curriculum',
      teaching_mode: teaching_mode || 'in_person',
      schedule_preference: schedule_preference?.trim() || undefined,
      preferred_days: Array.isArray(body.preferred_days) ? body.preferred_days : undefined,
      preferred_time_windows: Array.isArray(body.preferred_time_windows) ? body.preferred_time_windows : undefined,
      schedule_flexibility: body.schedule_flexibility || 'flexible_windows',
      earliest_start_date: body.earliest_start_date || undefined,
      hours_per_session: body.hours_per_session ? Number(body.hours_per_session) : 1.5,
      lessons_per_week: body.lessons_per_week ? Number(body.lessons_per_week) : 3,
      lesson_frequency: lesson_frequency?.trim() || undefined,
      budget_range_min: budget_range_min ? Number(budget_range_min) : undefined,
      budget_range_max: budget_range_max ? Number(budget_range_max) : undefined,
      preferred_language: preferred_language || 'English & Amharic',
      learning_goals: learning_goals?.trim() || undefined,
      privacy_consent: Boolean(privacy_consent),
      referral_source: referral_source || 'Website Form',
      utm_source: utm_source || undefined,
      utm_campaign: utm_campaign || undefined,
    });

    return NextResponse.json({
      success: true,
      reference_number: result.reference_number,
      id: result.id,
      message: 'Your tutoring request has been received. A Bruh Tesfa education coordinator will contact you shortly to confirm details and propose shortlisted tutors.',
    });
  } catch (error) {
    console.error('Error submitting parent request:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
