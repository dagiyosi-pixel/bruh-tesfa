// =============================================================================
// BRUH TESFA - Operational CSV Export API (GET /api/admin/export?type=...)
// Exports sanitized records without exposing unnecessary sensitive data
// =============================================================================

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import {
  getAdminPlacements,
  getAdminParentRequests,
  getAdminTutorApplications,
  getAdminVacancies,
  getAllVacancyApplications,
} from '@/lib/db/storage';

export const dynamic = 'force-dynamic';

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'placements';
    let csvContent = '';
    let filename = `bruh-tesfa-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'placements') {
      const placements = await getAdminPlacements();
      const headers = [
        'Placement ID',
        'Request ID',
        'Tutor ID',
        'Contract Type',
        'Agreed Rate (ETB)',
        'Total Contract Value (ETB)',
        'Commission (%)',
        'Commission Amount (ETB)',
        'Payment Status',
        'Payment Method',
        'Start Date',
        'Follow-up Status',
        'Created At',
      ];
      const rows = placements.map((p) => [
        p.id,
        p.request_id,
        p.tutor_id,
        p.contract_type,
        p.agreed_rate_etb,
        p.total_contract_value_etb,
        p.commission_percentage,
        p.commission_amount_etb,
        p.payment_status,
        p.payment_method || 'N/A',
        p.start_date,
        p.follow_up_status,
        p.created_at,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
    } else if (type === 'requests') {
      const requests = await getAdminParentRequests();
      const headers = [
        'Reference Number',
        'Parent Name',
        'Phone',
        'City',
        'Sub-City',
        'Subjects',
        'Grade Level',
        'Mode',
        'Status',
        'Budget Min',
        'Budget Max',
        'Created At',
      ];
      const rows = requests.map((r) => [
        r.reference_number,
        r.parent_name,
        r.phone,
        r.city,
        r.sub_city,
        r.subjects.join('; '),
        r.grade_level,
        r.teaching_mode,
        r.status,
        r.budget_range_min || 'N/A',
        r.budget_range_max || 'N/A',
        r.created_at,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
    } else if (type === 'vacancies') {
      const vacancies = await getAdminVacancies();
      const headers = [
        'Vacancy Code',
        'Title',
        'Sub-City',
        'General Area',
        'Grade Level',
        'Curriculum',
        'Subjects',
        'Teaching Format',
        'Hourly Rate (ETB)',
        'Status',
        'Views Count',
        'Applications Count',
        'Created At',
      ];
      const rows = vacancies.map((v) => [
        v.vacancy_code,
        v.title,
        v.sub_city,
        v.general_area || 'N/A',
        v.grade_level,
        v.curriculum,
        v.subjects.join('; '),
        v.teaching_format,
        v.hourly_rate_etb,
        v.status,
        v.view_count || 0,
        v.application_count || 0,
        v.created_at,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
    } else if (type === 'vacancy_applications') {
      const apps = await getAllVacancyApplications();
      const headers = [
        'Application ID',
        'Vacancy ID',
        'Applicant Name',
        'Phone',
        'Education',
        'Institution',
        'Experience (Years)',
        'Proposed Rate (ETB)',
        'Status',
        'Referral Source',
        'Created At',
      ];
      const rows = apps.map((a) => [
        a.id,
        a.vacancy_id,
        a.applicant_name,
        a.applicant_phone,
        a.applicant_education,
        a.applicant_institution,
        a.years_of_experience,
        a.proposed_rate_etb || 'N/A',
        a.status,
        a.referral_source || 'N/A',
        a.created_at,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
    } else {
      // type === 'tutors'
      const tutors = await getAdminTutorApplications();
      const headers = [
        'Reference Number',
        'Display Name',
        'Sub-City',
        'Education Level',
        'Institution',
        'Subjects',
        'Grade Levels',
        'Rate (ETB)',
        'Status',
        'Created At',
      ];
      const rows = tutors.map((t) => [
        t.reference_number,
        t.public_display_name,
        t.sub_city,
        t.education_level,
        t.institution,
        t.subjects.join('; '),
        t.grade_levels.join('; '),
        t.hourly_rate_etb,
        t.status,
        t.created_at,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
