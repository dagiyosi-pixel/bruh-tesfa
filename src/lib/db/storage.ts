// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Unified Data Access Layer (DAL)
// =============================================================================
// Supports both cloud Supabase PostgreSQL and persistent local storage
// for guaranteed zero-credential local development, automated testing, and CI.

import fs from 'fs';
import path from 'path';
import { getSupabaseClient, getStorageProviderInfo, ProductionStorageConfigurationError } from './supabase';

function getSafeSupabaseClient() {
  try {
    return getSupabaseClient();
  } catch (err) {
    if (err instanceof ProductionStorageConfigurationError) {
      return null;
    }
    throw err;
  }
}
export { getStorageProviderInfo };
import {
  TutorApplication,
  TutorPublicProfile,
  ParentRequest,
  CandidateMatch,
  MatchProposal,
  Placement,
  FeeConfiguration,
  Complaint,
  AuditLog,
  DataDeletionRequest,
  AdminMetrics,
  ApplicationStatus,
  ParentRequestStatus,
  PaymentStatus,
  TutoringVacancy,
  VacancyApplication,
  VacancyStatus,
  VacancyApplicationStatus,
  WeeklyAvailability,
  TelegramSubscriber,
  TelegramBroadcastLog,
} from '../types';
import {
  mergeOverlappingIntervals,
  validateTimeInterval,
  formatDayIntervals,
  DayOfWeek,
  DAYS_OF_WEEK,
} from '../availability';
import {
  INITIAL_TUTORS,
  INITIAL_PUBLIC_PROFILES,
  INITIAL_PARENT_REQUESTS,
  INITIAL_FEE_CONFIG,
  INITIAL_VACANCIES,
  INITIAL_VACANCY_APPLICATIONS,
  INITIAL_TELEGRAM_SUBSCRIBERS,
} from './seed';
import { evaluateCandidateMatch, rankCandidatesForRequest } from '../matching';
import { calculatePlacementFee } from '../fees';

interface DatabaseSchema {
  tutors: TutorApplication[];
  public_profiles: TutorPublicProfile[];
  parent_requests: ParentRequest[];
  matches: MatchProposal[];
  placements: Placement[];
  fee_config: FeeConfiguration;
  complaints: Complaint[];
  audit_logs: AuditLog[];
  data_deletion_requests: DataDeletionRequest[];
  vacancies: TutoringVacancy[];
  vacancy_applications: VacancyApplication[];
  telegram_subscribers: TelegramSubscriber[];
  telegram_broadcast_logs: TelegramBroadcastLog[];
}

// Local persistent file location
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'bruh-tesfa-db.json');

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // In read-only or serverless environments, fail silently to in-memory
    }
  }
}

// In-memory fallback cache
let memoryDb: DatabaseSchema | null = null;

function loadDatabase(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  ensureDataDirectory();

  if (fs.existsSync(DB_FILE)) {
    // Retry reading if file was caught mid-write by another process
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw && raw.trim().endsWith('}')) {
          memoryDb = JSON.parse(raw);
          if (!memoryDb!.vacancies) {
            memoryDb!.vacancies = [...INITIAL_VACANCIES];
          }
          if (!memoryDb!.vacancy_applications) {
            memoryDb!.vacancy_applications = [...INITIAL_VACANCY_APPLICATIONS];
          }
          if (!memoryDb!.telegram_subscribers) {
            memoryDb!.telegram_subscribers = [...INITIAL_TELEGRAM_SUBSCRIBERS];
          }
          if (!memoryDb!.telegram_broadcast_logs) {
            memoryDb!.telegram_broadcast_logs = [];
          }
          return memoryDb!;
        }
      } catch {
        // Short pause if another process is flushing
        const end = Date.now() + 50;
        while (Date.now() < end) {}
      }
    }
  }

  // Initial seed state
  memoryDb = {
    tutors: [...INITIAL_TUTORS],
    public_profiles: [...INITIAL_PUBLIC_PROFILES],
    parent_requests: [...INITIAL_PARENT_REQUESTS],
    matches: [
      {
        id: 'match-001',
        request_id: 'req-001',
        tutor_id: 'tut-001',
        match_score: 95,
        match_breakdown: {
          subject_score: 30,
          grade_score: 20,
          modality_score: 15,
          location_score: 15,
          language_score: 10,
          budget_score: 10,
          reasons: [
            '+30 pts: Teaches Physics & Mathematics',
            '+20 pts: EUEE University Entrance prep specialist',
            '+15 pts: In-person in Bole area',
            '+10 pts: Fluent in English & Amharic',
            '+10 pts: Within 400-550 ETB budget (450 ETB/hr)',
          ],
        },
        proposed_at: '2026-03-02T12:00:00Z',
        tutor_response: 'accepted',
        parent_response: 'accepted',
        status: 'confirmed',
        notes: 'Parent and tutor spoke via phone. First introductory lesson scheduled.',
        created_at: '2026-03-02T12:00:00Z',
        updated_at: '2026-03-02T16:00:00Z',
      },
    ],
    placements: [
      {
        id: 'plc-001',
        match_id: 'match-001',
        request_id: 'req-001',
        tutor_id: 'tut-001',
        contract_type: 'first_month_recurring',
        agreed_rate_etb: 450,
        total_contract_value_etb: 8100, // 3 sessions/wk * 1.5 hrs * 4 wks = 18 hrs * 450 = 8100 ETB
        commission_percentage: 60.0,
        commission_amount_etb: 4860, // 60% of 8100 ETB
        commission_basis_description: '60% one-time placement commission on first month recurring contract (18 hours)',
        terms_accepted_date: '2026-03-02T16:30:00Z',
        terms_version: 'v1.0-2026',
        payment_status: 'paid',
        payment_reference: 'CBE-TX-99882211',
        payment_method: 'CBE Birr',
        payment_received_at: '2026-03-04T10:00:00Z',
        start_date: '2026-03-05',
        replacement_guarantee_valid_until: '2026-03-19',
        follow_up_status: 'first_lesson_completed',
        follow_up_notes: 'Parent confirmed Dagmawi arrived punctually. Student very pleased with physics explanation.',
        created_at: '2026-03-02T16:30:00Z',
        updated_at: '2026-03-06T09:00:00Z',
      },
    ],
    fee_config: { ...INITIAL_FEE_CONFIG },
    complaints: [],
    audit_logs: [
      {
        id: 'log-001',
        actor: 'system',
        role: 'system',
        action: 'system_initialized',
        resource_type: 'database',
        resource_id: 'root',
        details: { message: 'BRUH TESFA local database initialized with production seeds' },
        created_at: new Date().toISOString(),
      },
    ],
    data_deletion_requests: [],
    vacancies: [...INITIAL_VACANCIES],
    vacancy_applications: [...INITIAL_VACANCY_APPLICATIONS],
    telegram_subscribers: [...INITIAL_TELEGRAM_SUBSCRIBERS],
    telegram_broadcast_logs: [],
  };

  saveDatabase(memoryDb);
  return memoryDb;
}

function saveDatabase(db: DatabaseSchema): void {
  memoryDb = db;
  if (process.env.NODE_ENV === 'test' || process.env.IS_TEST === 'true' || process.argv.some((arg) => arg.includes('test'))) {
    return;
  }
  ensureDataDirectory();
  const tmpFile = `${DB_FILE}.${process.pid}.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch {
    try {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    } catch {}
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to write database to disk (operating in-memory):', err);
    }
  }
}

// -----------------------------------------------------------------------------
// PUBLIC METHODS (Strictly sanitized, ZERO private data exposed)
// -----------------------------------------------------------------------------

export async function getPublicTutors(filters?: {
  subject?: string;
  grade?: string;
  modality?: string;
  subCity?: string;
  search?: string;
}): Promise<TutorPublicProfile[]> {
  const supabase = getSafeSupabaseClient();
  if (supabase) {
    let query = supabase.from('tutor_public_profiles').select('*').eq('is_verified', true);
    if (filters?.subject) query = query.contains('subjects', [filters.subject]);
    if (filters?.grade) query = query.contains('grade_levels', [filters.grade]);
    if (filters?.modality) query = query.contains('teaching_modes', [filters.modality]);
    if (filters?.subCity) query = query.contains('service_areas', [filters.subCity]);
    if (filters?.search) {
      const q = filters.search.trim();
      query = query.or(`display_name.ilike.%${q}%,bio.ilike.%${q}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(`Supabase query error: ${error.message}`);
    return data || [];
  }

  const db = loadDatabase();
  let profiles = db.public_profiles.filter((p) => p.is_verified);

  if (!filters) return profiles;

  if (filters.subject) {
    const s = filters.subject.toLowerCase();
    profiles = profiles.filter((p) => p.subjects.some((sub) => sub.toLowerCase().includes(s)));
  }

  if (filters.grade) {
    const g = filters.grade.toLowerCase();
    profiles = profiles.filter((p) => p.grade_levels.some((gl) => gl.toLowerCase().includes(g)));
  }

  if (filters.modality) {
    const m = filters.modality.toLowerCase();
    profiles = profiles.filter((p) => p.teaching_modes.some((tm) => tm.toLowerCase() === m || tm === 'hybrid'));
  }

  if (filters.subCity) {
    const sc = filters.subCity.toLowerCase();
    profiles = profiles.filter((p) => p.service_areas.some((area) => area.toLowerCase().includes(sc)));
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    profiles = profiles.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.subjects.some((s) => s.toLowerCase().includes(q)) ||
        p.service_areas.some((a) => a.toLowerCase().includes(q))
    );
  }

  return profiles;
}

export async function getPublicTutorBySlug(slug: string): Promise<TutorPublicProfile | null> {
  const supabase = getSafeSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('tutor_public_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_verified', true)
      .maybeSingle();
    if (error) throw new Error(`Supabase query error: ${error.message}`);
    return data || null;
  }

  const db = loadDatabase();
  const profile = db.public_profiles.find((p) => p.slug === slug && p.is_verified);
  return profile || null;
}

// -----------------------------------------------------------------------------
// PUBLIC SUBMISSION METHODS
// -----------------------------------------------------------------------------

export async function submitTutorApplication(
  data: Omit<TutorApplication, 'id' | 'reference_number' | 'status' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; reference_number: string; id: string }> {
  const supabase = getSafeSupabaseClient();
  if (supabase) {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const reference_number = `BT-TUT-2026-${seq}`;
    const { data: inserted, error } = await supabase
      .from('tutor_applications')
      .insert({
        ...data,
        reference_number,
        status: 'submitted',
      })
      .select('id, reference_number')
      .single();
    if (error) throw new Error(`Supabase error saving tutor application: ${error.message}`);
    return { success: true, reference_number: inserted.reference_number, id: inserted.id };
  }

  const db = loadDatabase();
  const id = `tut-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const seq = (db.tutors.length + 1).toString().padStart(4, '0');
  const reference_number = `BT-TUT-2026-${seq}`;
  const now = new Date().toISOString();

  const newApp: TutorApplication = {
    ...data,
    id,
    reference_number,
    status: 'submitted',
    created_at: now,
    updated_at: now,
  };

  db.tutors.push(newApp);

  // Log audit
  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: data.full_legal_name,
    role: 'applicant',
    action: 'tutor_application_submitted',
    resource_type: 'tutor_application',
    resource_id: id,
    details: { reference_number, public_display_name: data.public_display_name },
    created_at: now,
  });

  saveDatabase(db);
  return { success: true, reference_number, id };
}

export async function submitParentRequest(
  data: Omit<ParentRequest, 'id' | 'reference_number' | 'status' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; reference_number: string; id: string }> {
  const supabase = getSafeSupabaseClient();
  if (supabase) {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const reference_number = `BT-REQ-2026-${seq}`;
    const { data: inserted, error } = await supabase
      .from('parent_requests')
      .insert({
        ...data,
        reference_number,
        status: 'new',
      })
      .select('id, reference_number')
      .single();
    if (error) throw new Error(`Supabase error saving parent request: ${error.message}`);
    return { success: true, reference_number: inserted.reference_number, id: inserted.id };
  }

  const db = loadDatabase();
  const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const seq = (db.parent_requests.length + 1).toString().padStart(4, '0');
  const reference_number = `BT-REQ-2026-${seq}`;
  const now = new Date().toISOString();

  const newRequest: ParentRequest = {
    ...data,
    id,
    reference_number,
    status: 'new',
    created_at: now,
    updated_at: now,
  };

  db.parent_requests.push(newRequest);

  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: data.parent_name,
    role: 'parent',
    action: 'parent_request_submitted',
    resource_type: 'parent_request',
    resource_id: id,
    details: { reference_number, sub_city: data.sub_city, subjects: data.subjects },
    created_at: now,
  });

  saveDatabase(db);
  return { success: true, reference_number, id };
}

export async function submitComplaint(
  data: Omit<Complaint, 'id' | 'reference_number' | 'status' | 'created_at'>
): Promise<{ success: boolean; reference_number: string }> {
  const db = loadDatabase();
  const id = `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const seq = (db.complaints.length + 1).toString().padStart(4, '0');
  const reference_number = `BT-CMP-2026-${seq}`;
  const now = new Date().toISOString();

  const complaint: Complaint = {
    ...data,
    id,
    reference_number,
    status: 'open',
    created_at: now,
  };

  db.complaints.push(complaint);
  saveDatabase(db);
  return { success: true, reference_number };
}

export async function submitDataDeletionRequest(
  data: Omit<DataDeletionRequest, 'id' | 'reference_number' | 'status' | 'created_at'>
): Promise<{ success: boolean; reference_number: string }> {
  const db = loadDatabase();
  const id = `del-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const seq = (db.data_deletion_requests.length + 1).toString().padStart(4, '0');
  const reference_number = `BT-DEL-2026-${seq}`;

  const request: DataDeletionRequest = {
    ...data,
    id,
    reference_number,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  db.data_deletion_requests.push(request);
  saveDatabase(db);
  return { success: true, reference_number };
}

// -----------------------------------------------------------------------------
// ADMIN PROTECTED METHODS
// -----------------------------------------------------------------------------

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const db = loadDatabase();

  const totalTutorApplications = db.tutors.length;
  const pendingTutorReviews = db.tutors.filter((t) => t.status === 'submitted' || t.status === 'under_review').length;
  const approvedTutors = db.tutors.filter((t) => t.status === 'approved').length;

  const totalParentRequests = db.parent_requests.length;
  const activeRequests = db.parent_requests.filter((r) => r.status !== 'closed' && r.status !== 'cancelled').length;
  const activeMatches = db.matches.filter((m) => m.status === 'proposed' || m.status === 'confirmed').length;

  const totalPlacements = db.placements.length;
  const totalPlacementValueETB = db.placements.reduce((sum, p) => sum + Number(p.total_contract_value_etb || 0), 0);
  const totalCommissionDueETB = db.placements.reduce((sum, p) => sum + Number(p.commission_amount_etb || 0), 0);
  const totalCommissionPaidETB = db.placements
    .filter((p) => p.payment_status === 'paid')
    .reduce((sum, p) => sum + Number(p.commission_amount_etb || 0), 0);

  const openComplaints = db.complaints.filter((c) => c.status === 'open' || c.status === 'under_investigation').length;

  const totalVacancies = db.vacancies ? db.vacancies.length : 0;
  const openVacancies = db.vacancies ? db.vacancies.filter((v) => v.status === 'open' || v.status === 'closing_soon').length : 0;
  const totalVacancyApplications = db.vacancy_applications ? db.vacancy_applications.length : 0;
  const totalVacancyViews = db.vacancies ? db.vacancies.reduce((sum, v) => sum + (v.view_count || 0), 0) : 0;

  const telegramSubscribers = db.telegram_subscribers ? db.telegram_subscribers.length : 0;
  const activeTelegramSubscribers = db.telegram_subscribers ? db.telegram_subscribers.filter((s) => s.is_active).length : 0;
  const telegramBroadcastsCount = db.telegram_broadcast_logs ? db.telegram_broadcast_logs.length : 0;
  const telegramAttributedRequests = db.parent_requests.filter((r) => r.utm_source === 'telegram' || (r.referral_source && r.referral_source.toLowerCase().includes('telegram'))).length;
  const telegramAttributedTutors = db.tutors.filter((t) => t.utm_source === 'telegram' || (t.referral_source && t.referral_source.toLowerCase().includes('telegram'))).length;
  const telegramAttributedVacancyApps = db.vacancy_applications ? db.vacancy_applications.filter((v) => v.utm_source === 'telegram' || (v.referral_source && v.referral_source.toLowerCase().includes('telegram'))).length : 0;

  return {
    telegramSubscribers,
    activeTelegramSubscribers,
    telegramBroadcastsCount,
    telegramAttributedRequests,
    telegramAttributedTutors,
    telegramAttributedVacancyApps,
    totalTutorApplications,
    pendingTutorReviews,
    approvedTutors,
    totalParentRequests,
    activeRequests,
    activeMatches,
    totalPlacements,
    totalPlacementValueETB,
    totalCommissionDueETB,
    totalCommissionPaidETB,
    openComplaints,
    totalVacancies,
    openVacancies,
    totalVacancyApplications,
    totalVacancyViews,
  };
}

export async function getAdminTutorApplications(): Promise<TutorApplication[]> {
  const db = loadDatabase();
  return [...db.tutors].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateTutorApplicationStatus(
  id: string,
  status: ApplicationStatus,
  adminReviewNotes?: string,
  reviewedBy: string = 'Staff Admin'
): Promise<TutorApplication | null> {
  const db = loadDatabase();
  const tutor = db.tutors.find((t) => t.id === id);
  if (!tutor) return null;

  const now = new Date().toISOString();
  tutor.status = status;
  if (adminReviewNotes !== undefined) tutor.admin_review_notes = adminReviewNotes;
  tutor.reviewed_by = reviewedBy;
  tutor.reviewed_at = now;
  tutor.updated_at = now;

  // Sync with public profile if approved
  if (status === 'approved') {
    const slug = tutor.public_display_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existingIndex = db.public_profiles.findIndex((p) => p.id === tutor.id);

    const publicProf: TutorPublicProfile = {
      id: tutor.id,
      slug: `${slug}-${tutor.id.substring(tutor.id.length - 4)}`,
      display_name: tutor.public_display_name,
      bio: tutor.bio,
      teaching_approach: tutor.teaching_approach,
      education_summary: `${tutor.education_level} • ${tutor.institution}`,
      subjects: tutor.subjects,
      grade_levels: tutor.grade_levels,
      curricula: tutor.curricula,
      teaching_modes: tutor.teaching_modes,
      service_areas: tutor.travel_areas,
      hourly_rate_etb: tutor.hourly_rate_etb,
      languages: tutor.teaching_languages,
      avatar_url: tutor.avatar_url,
      is_verified: true,
      badge: 'Verified Tutor',
      total_lessons_placed: 0,
      created_at: tutor.created_at,
      updated_at: now,
    };

    if (existingIndex >= 0) {
      db.public_profiles[existingIndex] = publicProf;
    } else {
      db.public_profiles.push(publicProf);
    }
  } else if (status === 'suspended' || status === 'rejected') {
    // Remove from public view if rejected or suspended
    db.public_profiles = db.public_profiles.filter((p) => p.id !== tutor.id);
  }

  // Audit log
  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: reviewedBy,
    role: 'admin',
    action: `tutor_status_changed_to_${status}`,
    resource_type: 'tutor_application',
    resource_id: id,
    details: { status, adminReviewNotes },
    created_at: now,
  });

  saveDatabase(db);
  return tutor;
}

export async function getAdminParentRequests(): Promise<ParentRequest[]> {
  const db = loadDatabase();
  return [...db.parent_requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateParentRequestStatus(
  id: string,
  status: ParentRequestStatus,
  adminNotes?: string
): Promise<ParentRequest | null> {
  const db = loadDatabase();
  const req = db.parent_requests.find((r) => r.id === id);
  if (!req) return null;

  const now = new Date().toISOString();
  req.status = status;
  if (adminNotes !== undefined) req.admin_notes = adminNotes;
  req.updated_at = now;

  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: 'Staff Admin',
    role: 'admin',
    action: `parent_request_status_changed_to_${status}`,
    resource_type: 'parent_request',
    resource_id: id,
    details: { status, adminNotes },
    created_at: now,
  });

  saveDatabase(db);
  return req;
}

export async function getMatchingCandidatesForRequest(requestId: string): Promise<CandidateMatch[]> {
  const db = loadDatabase();
  const req = db.parent_requests.find((r) => r.id === requestId);
  if (!req) return [];

  // Consider all approved tutors
  const approvedTutors = db.tutors.filter((t) => t.status === 'approved');
  return rankCandidatesForRequest(req, approvedTutors);
}

export async function proposeCandidateMatch(
  requestId: string,
  tutorId: string,
  matchScore: number,
  notes?: string
): Promise<MatchProposal | null> {
  const db = loadDatabase();
  const req = db.parent_requests.find((r) => r.id === requestId);
  const tutor = db.tutors.find((t) => t.id === tutorId);
  if (!req || !tutor) return null;

  const matchEvaluation = evaluateCandidateMatch(req, tutor);

  const newMatch: MatchProposal = {
    id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    request_id: requestId,
    tutor_id: tutorId,
    match_score: matchScore || matchEvaluation.total_score,
    match_breakdown: matchEvaluation.breakdown,
    proposed_at: new Date().toISOString(),
    tutor_response: 'pending',
    parent_response: 'pending',
    status: 'proposed',
    notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.matches.push(newMatch);
  req.status = 'candidates_proposed';

  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: 'Staff Admin',
    role: 'admin',
    action: 'match_proposed',
    resource_type: 'match',
    resource_id: newMatch.id,
    details: { requestId, tutorId, matchScore: newMatch.match_score },
    created_at: new Date().toISOString(),
  });

  saveDatabase(db);
  return newMatch;
}

export async function getAdminMatches(): Promise<MatchProposal[]> {
  const db = loadDatabase();
  return [...db.matches].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createPlacementRecord(input: {
  matchId: string;
  agreedHourlyRateETB: number;
  contractType: 'first_month_recurring' | 'package_hours' | 'single_lesson';
  lessonsPerWeek?: number;
  hoursPerLesson?: number;
  totalPackageHours?: number;
  startDate: string;
}): Promise<Placement | null> {
  const db = loadDatabase();
  const match = db.matches.find((m) => m.id === input.matchId);
  if (!match) return null;

  // Prevent duplicate placement agreements for the same match
  const existingPlacement = db.placements.find((p) => p.match_id === input.matchId);
  if (existingPlacement) {
    throw new Error('A placement agreement has already been recorded and locked for this match proposal.');
  }

  const req = db.parent_requests.find((r) => r.id === match.request_id);
  const tutor = db.tutors.find((t) => t.id === match.tutor_id);
  if (!req || !tutor) return null;

  const feeResult = calculatePlacementFee({
    contractType: input.contractType,
    agreedHourlyRateETB: input.agreedHourlyRateETB,
    lessonsPerWeek: input.lessonsPerWeek,
    hoursPerLesson: input.hoursPerLesson,
    totalPackageHours: input.totalPackageHours,
    customCommissionPercentage: db.fee_config.default_commission_percentage,
  });

  const now = new Date().toISOString();
  const placement: Placement = {
    id: `plc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    match_id: input.matchId,
    request_id: match.request_id,
    tutor_id: match.tutor_id,
    contract_type: input.contractType,
    agreed_rate_etb: feeResult.agreedHourlyRateETB,
    total_contract_value_etb: feeResult.totalContractValueETB,
    commission_percentage: feeResult.commissionPercentage,
    commission_amount_etb: feeResult.commissionAmountETB,
    commission_basis_description: feeResult.basisExplanation,
    terms_accepted_date: now,
    terms_version: 'v1.0-2026',
    payment_status: 'due',
    start_date: input.startDate,
    follow_up_status: 'pending_first_lesson',
    created_at: now,
    updated_at: now,
  };

  db.placements.push(placement);
  match.status = 'confirmed';
  req.status = 'matched';

  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: 'Staff Admin',
    role: 'admin',
    action: 'placement_created',
    resource_type: 'placement',
    resource_id: placement.id,
    details: {
      totalValueETB: placement.total_contract_value_etb,
      commissionETB: placement.commission_amount_etb,
    },
    created_at: now,
  });

  saveDatabase(db);
  return placement;
}

export async function getAdminPlacements(): Promise<Placement[]> {
  const db = loadDatabase();
  return [...db.placements].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updatePlacementPayment(
  id: string,
  paymentStatus: PaymentStatus,
  paymentMethod?: string,
  paymentReference?: string,
  followUpStatus?: Placement['follow_up_status'],
  followUpNotes?: string
): Promise<Placement | null> {
  const db = loadDatabase();
  const placement = db.placements.find((p) => p.id === id);
  if (!placement) return null;

  const now = new Date().toISOString();
  placement.payment_status = paymentStatus;
  if (paymentMethod) placement.payment_method = paymentMethod;
  if (paymentReference) placement.payment_reference = paymentReference;
  if (paymentStatus === 'paid') placement.payment_received_at = now;
  if (followUpStatus) placement.follow_up_status = followUpStatus;
  if (followUpNotes) placement.follow_up_notes = followUpNotes;
  placement.updated_at = now;

  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: 'Staff Admin',
    role: 'admin',
    action: `placement_payment_updated_${paymentStatus}`,
    resource_type: 'placement',
    resource_id: id,
    details: { paymentStatus, paymentMethod, paymentReference },
    created_at: now,
  });

  saveDatabase(db);
  return placement;
}

export async function getAdminComplaints(): Promise<Complaint[]> {
  const db = loadDatabase();
  return [...db.complaints].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function resolveComplaint(
  id: string,
  resolutionNotes: string,
  status: Complaint['status'] = 'resolved',
  resolvedBy: string = 'Staff Admin'
): Promise<Complaint | null> {
  const db = loadDatabase();
  const c = db.complaints.find((comp) => comp.id === id);
  if (!c) return null;

  c.status = status;
  c.resolution_notes = resolutionNotes;
  c.resolved_by = resolvedBy;
  c.resolved_at = new Date().toISOString();

  saveDatabase(db);
  return c;
}

export async function getFeeConfig(): Promise<FeeConfiguration> {
  const db = loadDatabase();
  return db.fee_config;
}

export async function updateFeeConfig(
  default_commission_percentage: number,
  failure_replacement_policy?: string,
  repeat_client_policy?: string
): Promise<FeeConfiguration> {
  const db = loadDatabase();
  db.fee_config.default_commission_percentage = default_commission_percentage;
  if (failure_replacement_policy) db.fee_config.failure_replacement_policy = failure_replacement_policy;
  if (repeat_client_policy) db.fee_config.repeat_client_policy = repeat_client_policy;
  db.fee_config.effective_from = new Date().toISOString();

  saveDatabase(db);
  return db.fee_config;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const db = loadDatabase();
  return [...db.audit_logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getDataDeletionRequests(): Promise<DataDeletionRequest[]> {
  const db = loadDatabase();
  return [...db.data_deletion_requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// -----------------------------------------------------------------------------
// VACANCIES & JOB BOARD DATA ACCESS
// -----------------------------------------------------------------------------

export async function getPublicVacancies(filters?: {
  subCity?: string;
  grade?: string;
  subject?: string;
  modality?: string;
  minRate?: number;
  search?: string;
}): Promise<TutoringVacancy[]> {
  const supabase = getSafeSupabaseClient();
  if (supabase) {
    let query = supabase
      .from('tutoring_vacancies')
      .select('*')
      .in('status', ['open', 'closing_soon', 'filled']);
    if (filters?.subCity) query = query.ilike('sub_city', `%${filters.subCity}%`);
    if (filters?.grade) query = query.ilike('grade_level', `%${filters.grade}%`);
    if (filters?.subject) query = query.contains('subjects', [filters.subject]);
    if (filters?.minRate) query = query.gte('hourly_rate_etb', filters.minRate);
    if (filters?.search) {
      const q = filters.search.trim();
      query = query.or(`title.ilike.%${q}%,vacancy_code.ilike.%${q}%,sub_city.ilike.%${q}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(`Supabase query error: ${error.message}`);
    return data || [];
  }

  const db = loadDatabase();
  let list = (db.vacancies || []).filter(
    (v) => v.status === 'open' || v.status === 'closing_soon' || v.status === 'filled'
  );

  if (!filters) return list;

  if (filters.subCity) {
    const sc = filters.subCity.toLowerCase();
    list = list.filter((v) => v.sub_city.toLowerCase().includes(sc));
  }

  if (filters.grade) {
    const g = filters.grade.toLowerCase();
    list = list.filter((v) => v.grade_level.toLowerCase().includes(g));
  }

  if (filters.subject) {
    const sub = filters.subject.toLowerCase();
    list = list.filter((v) => v.subjects.some((s) => s.toLowerCase().includes(sub)));
  }

  if (filters.modality) {
    const m = filters.modality.toLowerCase();
    list = list.filter((v) => v.teaching_format.toLowerCase() === m || v.teaching_format === 'hybrid');
  }

  if (filters.minRate) {
    list = list.filter((v) => Number(v.hourly_rate_etb) >= Number(filters.minRate));
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.vacancy_code.toLowerCase().includes(q) ||
        v.sub_city.toLowerCase().includes(q) ||
        v.subjects.some((s) => s.toLowerCase().includes(q))
    );
  }

  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getPublicVacancyByCode(code: string, incrementView: boolean = true): Promise<TutoringVacancy | null> {
  const supabase = getSafeSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('tutoring_vacancies')
      .select('*')
      .ilike('vacancy_code', code)
      .maybeSingle();
    if (error) throw new Error(`Supabase query error: ${error.message}`);
    if (!data) return null;
    if (incrementView) {
      await supabase
        .from('tutoring_vacancies')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
      data.view_count = (data.view_count || 0) + 1;
    }
    return data;
  }

  const db = loadDatabase();
  const vacancy = (db.vacancies || []).find((v) => v.vacancy_code.toUpperCase() === code.toUpperCase());
  if (!vacancy) return null;

  if (incrementView) {
    vacancy.view_count = (vacancy.view_count || 0) + 1;
    saveDatabase(db);
  }

  return vacancy;
}

export async function submitVacancyApplication(
  data: Omit<VacancyApplication, 'id' | 'status' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; id: string; reference_number: string }> {
  const supabase = getSafeSupabaseClient();
  if (supabase) {
    const { data: vac, error: vacErr } = await supabase
      .from('tutoring_vacancies')
      .select('id, vacancy_code, status, application_count')
      .eq('id', data.vacancy_id)
      .maybeSingle();
    if (vacErr || !vac) throw new Error('Tutoring vacancy not found.');
    if (vac.status !== 'open' && vac.status !== 'closing_soon') {
      throw new Error('This vacancy is no longer accepting new applications.');
    }
    // Check duplicate active application
    const { data: existing } = await supabase
      .from('vacancy_applications')
      .select('id, status')
      .eq('vacancy_id', data.vacancy_id)
      .eq('applicant_phone', data.applicant_phone)
      .not('status', 'in', '("withdrawn","not_selected")')
      .maybeSingle();
    if (existing) {
      throw new Error('You have already submitted an active application for this vacancy.');
    }
    const { data: inserted, error: insErr } = await supabase
      .from('vacancy_applications')
      .insert({ ...data, status: 'submitted' })
      .select('id')
      .single();
    if (insErr) throw new Error(`Failed to submit vacancy application: ${insErr.message}`);
    await supabase
      .from('tutoring_vacancies')
      .update({ application_count: (vac.application_count || 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', data.vacancy_id);
    return { success: true, id: inserted.id, reference_number: vac.vacancy_code };
  }

  const db = loadDatabase();
  const vacancy = (db.vacancies || []).find((v) => v.id === data.vacancy_id);
  if (!vacancy) {
    throw new Error('Tutoring vacancy not found.');
  }

  if (vacancy.status !== 'open' && vacancy.status !== 'closing_soon') {
    throw new Error('This vacancy is no longer accepting new applications.');
  }

  // Prevent duplicate active applications from the same applicant phone or tutorId
  const normalizedPhone = data.applicant_phone.replace(/\s+/g, '');
  const existingActive = (db.vacancy_applications || []).find(
    (app) =>
      app.vacancy_id === data.vacancy_id &&
      (app.applicant_phone.replace(/\s+/g, '') === normalizedPhone ||
        (data.tutor_id && app.tutor_id === data.tutor_id)) &&
      app.status !== 'withdrawn' &&
      app.status !== 'not_selected'
  );

  if (existingActive) {
    throw new Error('You have already submitted an active application for this vacancy.');
  }

  const now = new Date().toISOString();
  const id = `vapp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const application: VacancyApplication = {
    ...data,
    id,
    status: 'submitted',
    created_at: now,
    updated_at: now,
  };

  if (!db.vacancy_applications) db.vacancy_applications = [];
  db.vacancy_applications.push(application);

  // Increment application count on the vacancy
  vacancy.application_count = (vacancy.application_count || 0) + 1;
  vacancy.updated_at = now;

  // Audit log
  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: data.applicant_name,
    role: 'tutor_applicant',
    action: 'vacancy_application_submitted',
    resource_type: 'vacancy_application',
    resource_id: id,
    details: { vacancy_code: vacancy.vacancy_code, applicant_phone: data.applicant_phone },
    created_at: now,
  });

  saveDatabase(db);
  return { success: true, id, reference_number: vacancy.vacancy_code };
}

export async function getAdminVacancies(): Promise<TutoringVacancy[]> {
  const db = loadDatabase();
  return [...(db.vacancies || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createVacancy(
  data: Omit<TutoringVacancy, 'id' | 'vacancy_code' | 'view_count' | 'application_count' | 'created_at' | 'updated_at'>
): Promise<TutoringVacancy> {
  const db = loadDatabase();
  if (!db.vacancies) db.vacancies = [];

  const id = `vac-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const seq = (db.vacancies.length + 1).toString().padStart(4, '0');
  const vacancy_code = `BT-VAC-2026-${seq}`;
  const now = new Date().toISOString();

  const newVacancy: TutoringVacancy = {
    ...data,
    id,
    vacancy_code,
    view_count: 0,
    application_count: 0,
    created_at: now,
    updated_at: now,
  };

  db.vacancies.push(newVacancy);

  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: 'Staff Admin',
    role: 'admin',
    action: 'vacancy_created',
    resource_type: 'tutoring_vacancy',
    resource_id: id,
    details: { vacancy_code, title: data.title },
    created_at: now,
  });

  saveDatabase(db);
  return newVacancy;
}

export async function updateVacancy(
  id: string,
  data: Partial<Omit<TutoringVacancy, 'id' | 'vacancy_code' | 'created_at'>>
): Promise<TutoringVacancy | null> {
  const db = loadDatabase();
  const v = (db.vacancies || []).find((item) => item.id === id);
  if (!v) return null;

  Object.assign(v, data);
  v.updated_at = new Date().toISOString();

  saveDatabase(db);
  return v;
}

export async function updateVacancyStatus(
  id: string,
  status: VacancyStatus
): Promise<TutoringVacancy | null> {
  const db = loadDatabase();
  const v = (db.vacancies || []).find((item) => item.id === id);
  if (!v) return null;

  const now = new Date().toISOString();
  v.status = status;
  v.updated_at = now;

  if (status === 'open' && !v.published_at) {
    v.published_at = now;
  } else if (status === 'closed' || status === 'filled') {
    v.closed_at = now;
  }

  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: 'Staff Admin',
    role: 'admin',
    action: `vacancy_status_changed_to_${status}`,
    resource_type: 'tutoring_vacancy',
    resource_id: id,
    details: { vacancy_code: v.vacancy_code, status },
    created_at: now,
  });

  saveDatabase(db);
  return v;
}

/**
 * Converts a private parent request into a sanitized, moderated vacancy draft.
 * Strips family's private phone number, parent name, and exact street details!
 */
export async function convertParentRequestToVacancy(requestId: string): Promise<TutoringVacancy | null> {
  const db = loadDatabase();
  const req = db.parent_requests.find((r) => r.id === requestId);
  if (!req) return null;

  const subjectsTitle = req.subjects.slice(0, 2).join(' & ');
  const title = `${req.grade_level} ${subjectsTitle} Home Tutor - ${req.sub_city}`;
  const rate = req.budget_range_max ? Number(req.budget_range_max) : 450;
  const days = req.schedule_preference ? [req.schedule_preference] : ['3 days per week'];

  // Strict Privacy Sanitization: Strip exact house, flat, door, or building unit numbers from general area
  let sanitizedArea: string | undefined = req.general_area ? req.general_area.trim() : undefined;
  if (sanitizedArea) {
    sanitizedArea = sanitizedArea
      .replace(/,?\s*(?:house|apt|apartment|flat|door|unit|villa|compound|block)\s*(?:no\.?|#|number)?\s*[\w\d-]+/gi, '')
      .replace(/,\s*,/g, ',')
      .trim()
      .replace(/^,\s*|,\s*$/g, '');
  }

  // Moderate parent preferences (remove private prefix tags)
  let moderatedPreferences = req.learning_goals ? req.learning_goals.trim() : undefined;
  if (moderatedPreferences) {
    moderatedPreferences = moderatedPreferences
      .replace(/^(?:private\s*note:?|internal:?|confidential:?)\s*/gi, '')
      .trim();
  }

  const vacancy = await createVacancy({
    title,
    parent_request_id: req.id,
    city: req.city || 'Addis Ababa',
    sub_city: req.sub_city,
    general_area: sanitizedArea || undefined,
    grade_level: req.grade_level,
    curriculum: req.curriculum || 'Ethiopian National Curriculum',
    subjects: req.subjects,
    teaching_format: req.teaching_mode || 'in_person',
    schedule_days: days,
    time_window: 'Afternoon / Evening',
    lesson_frequency: req.lesson_frequency || '3 days per week (1.5 hrs each)',
    hours_per_session: 1.5,
    expected_duration_months: 3,
    hourly_rate_etb: rate,
    total_estimated_budget_etb: rate * 1.5 * 3 * 4,
    required_qualifications: `Qualified educator with degree in ${req.subjects.join(', ')} or related discipline with proven track record.`,
    languages: req.preferred_language ? [req.preferred_language] : ['English', 'Amharic (አማርኛ)'],
    parent_preferences: moderatedPreferences || undefined,
    application_instructions: 'Submit your profile and approach. Shortlisted educators will be introduced to the family.',
    status: 'draft', // Saved in draft for operator review before public publishing
  });

  // Update parent request status to indicate vacancy created
  req.status = 'matching';
  req.admin_notes = `Converted to Vacancy draft ${vacancy.vacancy_code}.`;
  saveDatabase(db);

  return vacancy;
}

export async function getVacancyApplications(vacancyId: string): Promise<VacancyApplication[]> {
  const db = loadDatabase();
  return (db.vacancy_applications || [])
    .filter((a) => a.vacancy_id === vacancyId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getAllVacancyApplications(): Promise<VacancyApplication[]> {
  const db = loadDatabase();
  return [...(db.vacancy_applications || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function updateVacancyApplicationStatus(
  applicationId: string,
  status: VacancyApplicationStatus,
  adminReviewNotes?: string
): Promise<VacancyApplication | null> {
  const db = loadDatabase();
  const app = (db.vacancy_applications || []).find((a) => a.id === applicationId);
  if (!app) return null;

  app.status = status;
  if (adminReviewNotes !== undefined) app.admin_review_notes = adminReviewNotes;
  app.updated_at = new Date().toISOString();

  // If status is selected, also mark vacancy as filled
  if (status === 'selected') {
    const vac = (db.vacancies || []).find((v) => v.id === app.vacancy_id);
    if (vac) {
      vac.status = 'filled';
      vac.closed_at = new Date().toISOString();
    }
  }

  saveDatabase(db);
  return app;
}

export async function recordTelegramBroadcast(vacancyId: string, messageId: string): Promise<void> {
  const db = loadDatabase();
  const vac = (db.vacancies || []).find((v) => v.id === vacancyId);
  if (vac) {
    vac.telegram_message_id = messageId;
    vac.telegram_published_at = new Date().toISOString();
    saveDatabase(db);
  }
}

// -----------------------------------------------------------------------------
// TUTOR AVAILABILITY & PORTAL METHODS
// -----------------------------------------------------------------------------

export async function updateTutorAvailability(
  tutorId: string,
  availability: WeeklyAvailability,
  blackoutDates?: string[]
): Promise<{ success: boolean; tutor: TutorApplication }> {
  const db = loadDatabase();
  const tutor = db.tutors.find((t) => t.id === tutorId);
  if (!tutor) {
    throw new Error('Tutor application not found');
  }

  // Sanitize and validate intervals per day
  const cleanedSchedule: WeeklyAvailability['schedule'] = {};
  const activeDays: string[] = [];

  for (const day of DAYS_OF_WEEK) {
    const rawIntervals = availability.schedule?.[day] || [];
    if (rawIntervals.length > 0) {
      // Validate each interval
      for (const inv of rawIntervals) {
        const val = validateTimeInterval(inv, availability.min_lesson_duration_minutes || 30);
        if (!val.isValid) {
          throw new Error(`Invalid schedule for ${day}: ${val.error}`);
        }
      }
      // Merge overlapping/contiguous intervals
      const merged = mergeOverlappingIntervals(rawIntervals);
      cleanedSchedule[day] = merged;
      activeDays.push(day);
    }
  }

  const now = new Date().toISOString();
  const sanitizedAvailability: WeeklyAvailability = {
    timezone: availability.timezone || 'Africa/Addis_Ababa',
    schedule: cleanedSchedule,
    min_lesson_duration_minutes: availability.min_lesson_duration_minutes || 60,
    max_lesson_duration_minutes: availability.max_lesson_duration_minutes || 120,
    max_weekly_hours: availability.max_weekly_hours || 20,
    blackout_dates: blackoutDates || availability.blackout_dates || [],
    extra_dates: availability.extra_dates || [],
    updated_at: now,
  };

  tutor.weekly_availability = sanitizedAvailability;
  tutor.available_days = activeDays;
  if (blackoutDates) {
    tutor.blackout_dates = blackoutDates;
  }
  tutor.updated_at = now;

  // Sync to public profile if approved
  const publicProf = db.public_profiles.find((p) => p.id === tutorId);
  if (publicProf) {
    publicProf.available_days = activeDays;
    publicProf.weekly_summary = activeDays.map((d) => `${d}: ${formatDayIntervals(cleanedSchedule[d as DayOfWeek] || [])}`).join(' | ');
    publicProf.updated_at = now;
  }

  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor: tutor.public_display_name,
    role: 'tutor',
    action: 'tutor_availability_updated',
    resource_type: 'tutor_application',
    resource_id: tutorId,
    details: { activeDaysCount: activeDays.length, activeDays },
    created_at: now,
  });

  saveDatabase(db);
  return { success: true, tutor };
}

export async function confirmTutorAvailability(
  tutorId: string,
  notes?: string,
  actor: string = 'Staff Admin'
): Promise<TutorApplication> {
  const db = loadDatabase();
  const tutor = db.tutors.find((t) => t.id === tutorId);
  if (!tutor) {
    throw new Error('Tutor not found');
  }

  const now = new Date().toISOString();
  tutor.availability_confirmed_at = now;
  if (notes) {
    tutor.availability_notes = notes;
  }
  tutor.updated_at = now;

  db.audit_logs.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor,
    role: 'admin',
    action: 'tutor_availability_confirmed_by_coordinator',
    resource_type: 'tutor_application',
    resource_id: tutorId,
    details: { notes, confirmedAt: now },
    created_at: now,
  });

  saveDatabase(db);
  return tutor;
}

export async function getTutorAvailability(tutorId: string): Promise<{
  tutorId: string;
  name: string;
  status: ApplicationStatus;
  weekly_availability?: WeeklyAvailability;
  available_days: string[];
  blackout_dates?: string[];
  availability_confirmed_at?: string;
  availability_notes?: string;
} | null> {
  const db = loadDatabase();
  const tutor = db.tutors.find((t) => t.id === tutorId);
  if (!tutor) return null;

  return {
    tutorId: tutor.id,
    name: tutor.public_display_name,
    status: tutor.status,
    weekly_availability: tutor.weekly_availability,
    available_days: tutor.available_days,
    blackout_dates: tutor.blackout_dates,
    availability_confirmed_at: tutor.availability_confirmed_at,
    availability_notes: tutor.availability_notes,
  };
}

export async function lookupTutorPortalStatus(
  referenceNumber: string,
  phone: string
): Promise<{
  success: boolean;
  tutor?: {
    id: string;
    reference_number: string;
    public_display_name: string;
    status: ApplicationStatus;
    subjects: string[];
    grade_levels: string[];
    curricula: string[];
    teaching_modes: string[];
    travel_areas: string[];
    hourly_rate_etb: number;
    weekly_availability?: WeeklyAvailability;
    blackout_dates?: string[];
    availability_confirmed_at?: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}> {
  if (!referenceNumber || !phone) {
    return { success: false, error: 'Reference number and phone number are required' };
  }

  const db = loadDatabase();
  const normRef = referenceNumber.trim().toUpperCase();
  const normPhone = phone.replace(/[\s\-\(\)]/g, '');

  const tutor = db.tutors.find(
    (t) =>
      t.reference_number.trim().toUpperCase() === normRef &&
      t.phone.replace(/[\s\-\(\)]/g, '') === normPhone
  );

  if (!tutor) {
    return { success: false, error: 'No matching application found with those credentials' };
  }

  // Strictly sanitize: NEVER return admin_review_notes or private identity document paths
  return {
    success: true,
    tutor: {
      id: tutor.id,
      reference_number: tutor.reference_number,
      public_display_name: tutor.public_display_name,
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
      updated_at: tutor.updated_at,
    },
  };
}

// =============================================================================
// TELEGRAM BOT SUBSCRIBERS & BROADCAST LOGS
// =============================================================================

export async function getTelegramSubscribers(): Promise<TelegramSubscriber[]> {
  const db = loadDatabase();
  return db.telegram_subscribers || [];
}

export async function getActiveTelegramSubscribers(): Promise<TelegramSubscriber[]> {
  const db = loadDatabase();
  return (db.telegram_subscribers || []).filter((s) => s.is_active);
}

export async function getTelegramSubscriber(chatId: number): Promise<TelegramSubscriber | null> {
  const db = loadDatabase();
  return (db.telegram_subscribers || []).find((s) => Number(s.chat_id) === Number(chatId)) || null;
}

export async function upsertTelegramSubscriber(data: {
  chat_id: number;
  username?: string;
  first_name?: string;
  is_active?: boolean;
  subjects?: string[];
  grade_levels?: string[];
  sub_cities?: string[];
  teaching_format?: 'in_person' | 'online' | 'either';
}): Promise<TelegramSubscriber> {
  const db = loadDatabase();
  if (!db.telegram_subscribers) db.telegram_subscribers = [];

  const existingIdx = db.telegram_subscribers.findIndex((s) => Number(s.chat_id) === Number(data.chat_id));
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const existing = db.telegram_subscribers[existingIdx];
    const updated: TelegramSubscriber = {
      ...existing,
      username: data.username !== undefined ? data.username : existing.username,
      first_name: data.first_name !== undefined ? data.first_name : existing.first_name,
      is_active: data.is_active !== undefined ? data.is_active : existing.is_active,
      subjects: data.subjects !== undefined ? data.subjects : existing.subjects,
      grade_levels: data.grade_levels !== undefined ? data.grade_levels : existing.grade_levels,
      sub_cities: data.sub_cities !== undefined ? data.sub_cities : existing.sub_cities,
      teaching_format: data.teaching_format !== undefined ? data.teaching_format : existing.teaching_format,
      updated_at: now,
    };
    db.telegram_subscribers[existingIdx] = updated;
    saveDatabase(db);
    return updated;
  } else {
    const newSub: TelegramSubscriber = {
      id: 'tsub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      chat_id: Number(data.chat_id),
      username: data.username,
      first_name: data.first_name,
      is_active: data.is_active !== undefined ? data.is_active : true,
      subjects: data.subjects || [],
      grade_levels: data.grade_levels || [],
      sub_cities: data.sub_cities || [],
      teaching_format: data.teaching_format || 'either',
      created_at: now,
      updated_at: now,
    };
    db.telegram_subscribers.push(newSub);
    saveDatabase(db);
    return newSub;
  }
}

export async function unsubscribeTelegramSubscriber(chatId: number): Promise<boolean> {
  const db = loadDatabase();
  if (!db.telegram_subscribers) return false;

  const sub = db.telegram_subscribers.find((s) => Number(s.chat_id) === Number(chatId));
  if (!sub) return false;

  sub.is_active = false;
  sub.updated_at = new Date().toISOString();
  saveDatabase(db);
  return true;
}

export async function recordTelegramBroadcastLog(log: Omit<TelegramBroadcastLog, 'id' | 'created_at'>): Promise<TelegramBroadcastLog> {
  const db = loadDatabase();
  if (!db.telegram_broadcast_logs) db.telegram_broadcast_logs = [];

  const newLog: TelegramBroadcastLog = {
    id: 'tlog-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    ...log,
    created_at: new Date().toISOString(),
  };

  db.telegram_broadcast_logs.push(newLog);

  if (log.vacancy_id && log.status === 'published') {
    const vac = (db.vacancies || []).find((v) => v.id === log.vacancy_id);
    if (vac) {
      vac.telegram_message_id = log.message_id;
      vac.telegram_published_at = newLog.created_at;
    }
  }

  saveDatabase(db);
  return newLog;
}

export async function getTelegramBroadcastLogs(vacancyId?: string): Promise<TelegramBroadcastLog[]> {
  const db = loadDatabase();
  const logs = db.telegram_broadcast_logs || [];
  if (vacancyId) {
    return logs.filter((l) => l.vacancy_id === vacancyId);
  }
  return [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function hasVacancyBeenBroadcast(vacancyId: string, channelId: string): Promise<boolean> {
  const db = loadDatabase();
  const logs = db.telegram_broadcast_logs || [];
  return logs.some(
    (l) => l.vacancy_id === vacancyId && l.channel_id === channelId && l.status === 'published'
  );
}

export async function getTelegramMarketingMetrics(): Promise<{
  totalSubscribers: number;
  activeSubscribers: number;
  totalBroadcasts: number;
  telegramAttributedTutors: number;
  telegramAttributedParents: number;
  telegramAttributedVacancyApps: number;
}> {
  const db = loadDatabase();
  const subs = db.telegram_subscribers || [];
  const broadcasts = db.telegram_broadcast_logs || [];

  const telegramAttributedTutors = db.tutors.filter(
    (t) => t.utm_source === 'telegram' || (t.referral_source && t.referral_source.toLowerCase().includes('telegram'))
  ).length;

  const telegramAttributedParents = db.parent_requests.filter(
    (r) => r.utm_source === 'telegram' || (r.referral_source && r.referral_source.toLowerCase().includes('telegram'))
  ).length;

  const telegramAttributedVacancyApps = (db.vacancy_applications || []).filter(
    (v) => v.utm_source === 'telegram' || (v.referral_source && v.referral_source.toLowerCase().includes('telegram'))
  ).length;

  return {
    totalSubscribers: subs.length,
    activeSubscribers: subs.filter((s) => s.is_active).length,
    totalBroadcasts: broadcasts.length,
    telegramAttributedTutors,
    telegramAttributedParents,
    telegramAttributedVacancyApps,
  };
}
