// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Unified Data Access Layer (DAL)
// =============================================================================
// Supports both cloud Supabase PostgreSQL and persistent local storage
// for guaranteed zero-credential local development, automated testing, and CI.

import fs from 'fs';
import path from 'path';
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
} from '../types';
import {
  INITIAL_TUTORS,
  INITIAL_PUBLIC_PROFILES,
  INITIAL_PARENT_REQUESTS,
  INITIAL_FEE_CONFIG,
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
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(raw);
      return memoryDb!;
    } catch (err) {
      console.warn('Could not parse local DB file, initializing with seeds:', err);
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
  };

  saveDatabase(memoryDb);
  return memoryDb;
}

function saveDatabase(db: DatabaseSchema): void {
  memoryDb = db;
  ensureDataDirectory();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write database to disk (operating in-memory):', err);
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
  const db = loadDatabase();
  const id = `tut-${Date.now()}`;
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
    id: `log-${Date.now()}`,
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
  const db = loadDatabase();
  const id = `req-${Date.now()}`;
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
    id: `log-${Date.now()}`,
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
  const id = `cmp-${Date.now()}`;
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
  const id = `del-${Date.now()}`;
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

  return {
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
    id: `log-${Date.now()}`,
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
    id: `log-${Date.now()}`,
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
    id: `match-${Date.now()}`,
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
    id: `log-${Date.now()}`,
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
    id: `plc-${Date.now()}`,
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
    id: `log-${Date.now()}`,
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
    id: `log-${Date.now()}`,
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
