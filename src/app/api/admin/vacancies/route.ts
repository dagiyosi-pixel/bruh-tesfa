// =============================================================================
// BRUH TESFA - Admin Vacancies Management API (GET, POST, PATCH /api/admin/vacancies)
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getAdminVacancies, createVacancy, updateVacancy, updateVacancyStatus } from '@/lib/db/storage';
import { VacancyStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vacancies = await getAdminVacancies();
    return NextResponse.json({ success: true, count: vacancies.length, vacancies });
  } catch (error) {
    console.error('Error fetching admin vacancies:', error);
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
    const {
      title,
      sub_city,
      general_area,
      grade_level,
      curriculum,
      subjects,
      teaching_format,
      schedule_days,
      time_window,
      lesson_frequency,
      hours_per_session,
      expected_duration_months,
      hourly_rate_etb,
      total_estimated_budget_etb,
      required_qualifications,
      languages,
      parent_preferences,
      application_deadline,
      application_instructions,
      status,
    } = body;

    if (!title || !sub_city || !grade_level || !subjects || subjects.length === 0 || !hourly_rate_etb) {
      return NextResponse.json(
        { success: false, error: 'Title, sub-city, grade level, subjects, and hourly rate are required.' },
        { status: 400 }
      );
    }

    const vacancy = await createVacancy({
      title: title.trim(),
      city: 'Addis Ababa',
      sub_city: sub_city.trim(),
      general_area: general_area?.trim() || undefined,
      grade_level: grade_level.trim(),
      curriculum: curriculum || 'Ethiopian National Curriculum',
      subjects,
      teaching_format: teaching_format || 'in_person',
      schedule_days: Array.isArray(schedule_days) ? schedule_days : [],
      time_window: time_window?.trim() || 'Afternoon hours',
      lesson_frequency: lesson_frequency || '3 days per week',
      hours_per_session: Number(hours_per_session) || 1.5,
      expected_duration_months: Number(expected_duration_months) || 3,
      hourly_rate_etb: Number(hourly_rate_etb),
      total_estimated_budget_etb: total_estimated_budget_etb ? Number(total_estimated_budget_etb) : undefined,
      required_qualifications: required_qualifications?.trim() || 'Degree in relevant subject area.',
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['English', 'Amharic (አማርኛ)'],
      parent_preferences: parent_preferences?.trim() || undefined,
      application_deadline: application_deadline || undefined,
      application_instructions: application_instructions?.trim() || undefined,
      status: (status as VacancyStatus) || 'draft',
    });

    return NextResponse.json({ success: true, vacancy });
  } catch (error) {
    console.error('Error creating vacancy:', error);
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
    const { id, status, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Vacancy ID is required' }, { status: 400 });
    }

    if (status) {
      const updated = await updateVacancyStatus(id, status as VacancyStatus);
      return NextResponse.json({ success: true, vacancy: updated });
    }

    const updated = await updateVacancy(id, updates);
    return NextResponse.json({ success: true, vacancy: updated });
  } catch (error) {
    console.error('Error updating vacancy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
