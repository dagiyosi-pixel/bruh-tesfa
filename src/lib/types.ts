// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Domain Models & Type Definitions
// =============================================================================

import { WeeklyAvailability, TimeInterval, ScheduleCompatibilityStatus } from './availability';
export type { WeeklyAvailability, TimeInterval, ScheduleCompatibilityStatus };

export type TeachingMode = 'in_person' | 'online' | 'hybrid';

export type ApplicationStatus = 
  | 'submitted'
  | 'under_review'
  | 'needs_info'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type ParentRequestStatus = 
  | 'new'
  | 'reviewing'
  | 'matching'
  | 'candidates_proposed'
  | 'matched'
  | 'active'
  | 'closed'
  | 'cancelled';

export type MatchStatus = 
  | 'proposed'
  | 'tutor_accepted'
  | 'parent_accepted'
  | 'confirmed'
  | 'declined'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending_invoice'
  | 'due'
  | 'partially_paid'
  | 'paid'
  | 'waived_cancellation'
  | 'refunded';

export type ContractType = 
  | 'first_month_recurring'
  | 'package_hours'
  | 'single_lesson';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent_safeguarding';
export type ComplaintStatus = 'open' | 'under_investigation' | 'action_taken' | 'resolved' | 'dismissed';

export interface TutorApplication {
  id: string;
  reference_number: string;
  
  // Private identifying details (Protected on server, NEVER exposed to public visitors)
  full_legal_name: string;
  phone: string;
  email: string;
  preferred_contact_channel: 'Telegram' | 'Phone' | 'WhatsApp';
  city: string;
  sub_city: string;
  specific_neighborhood?: string;
  
  // Teaching profile
  public_display_name: string;
  subjects: string[];
  grade_levels: string[];
  curricula: string[];
  
  // Qualifications & Experience
  education_level: string;
  institution: string;
  field_of_study: string;
  years_of_experience: number;
  teaching_approach: string;
  bio: string;
  teaching_languages: string[];
  
  // Availability & Modality
  available_days: string[];
  available_time_windows: string[];
  weekly_availability?: WeeklyAvailability;
  blackout_dates?: string[];
  min_lesson_duration_minutes?: number;
  max_lesson_duration_minutes?: number;
  max_weekly_hours?: number;
  availability_confirmed_at?: string;
  availability_notes?: string;
  teaching_modes: TeachingMode[];
  travel_areas: string[];
  hourly_rate_etb: number;
  
  // Private Storage Documents
  national_id_doc_path?: string;
  degree_cert_doc_path?: string;
  avatar_url?: string;
  
  // Consent & Code of Conduct
  privacy_consent: boolean;
  code_of_conduct_agreed: boolean;
  
  // Status & Admin Fields
  status: ApplicationStatus;
  admin_review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  
  // Marketing & Referral Tracking
  referral_source?: string;
  utm_source?: string;
  utm_campaign?: string;
  
  created_at: string;
  updated_at: string;
}

export interface TutorPublicProfile {
  id: string;
  slug: string;
  display_name: string;
  bio: string;
  teaching_approach: string;
  education_summary: string;
  subjects: string[];
  grade_levels: string[];
  curricula: string[];
  teaching_modes: TeachingMode[];
  service_areas: string[];
  available_days?: string[];
  weekly_summary?: string;
  hourly_rate_etb: number;
  languages: string[];
  avatar_url?: string;
  is_verified: boolean;
  badge: string;
  total_lessons_placed: number;
  created_at: string;
  updated_at: string;
}

export interface ParentRequest {
  id: string;
  reference_number: string;
  
  parent_name: string;
  phone: string;
  email?: string;
  preferred_contact_method: 'Phone' | 'Telegram' | 'WhatsApp';
  
  city: string;
  sub_city: string;
  general_area?: string;
  
  target_tutor_id?: string;
  
  subjects: string[];
  grade_level: string;
  curriculum: string;
  teaching_mode: TeachingMode;
  schedule_preference?: string;
  preferred_days?: string[];
  preferred_time_windows?: string[];
  schedule_flexibility?: 'strict_times' | 'flexible_windows' | 'weekends_only' | 'open_schedule';
  earliest_start_date?: string;
  hours_per_session?: number;
  lessons_per_week?: number;
  lesson_frequency?: string;
  budget_range_min?: number;
  budget_range_max?: number;
  preferred_language: string;
  learning_goals?: string;
  
  status: ParentRequestStatus;
  admin_notes?: string;
  privacy_consent: boolean;
  
  referral_source?: string;
  utm_source?: string;
  utm_campaign?: string;
  
  created_at: string;
  updated_at: string;
}

export interface MatchBreakdown {
  subject_score: number;
  grade_score: number;
  modality_score: number;
  location_score: number;
  language_score: number;
  budget_score: number;
  schedule_score?: number;
  schedule_status?: ScheduleCompatibilityStatus;
  schedule_explanation?: string;
  reasons: string[];
}

export interface CandidateMatch {
  tutor: TutorPublicProfile | TutorApplication;
  total_score: number;
  breakdown: MatchBreakdown;
  schedule_status?: ScheduleCompatibilityStatus;
  is_eligible: boolean;
}

export interface MatchProposal {
  id: string;
  request_id: string;
  tutor_id: string;
  match_score: number;
  match_breakdown: MatchBreakdown;
  proposed_at: string;
  tutor_response: 'pending' | 'accepted' | 'declined';
  parent_response: 'pending' | 'accepted' | 'declined';
  status: MatchStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Placement {
  id: string;
  match_id: string;
  request_id: string;
  tutor_id: string;
  
  contract_type: ContractType;
  agreed_rate_etb: number;
  total_contract_value_etb: number;
  commission_percentage: number; // typically 60%
  commission_amount_etb: number;
  commission_basis_description: string;
  
  terms_accepted_date: string;
  terms_version: string;
  
  payment_status: PaymentStatus;
  payment_reference?: string;
  payment_method?: string; // Telebirr, CBE Birr, Awash, Cash
  payment_received_at?: string;
  
  start_date: string;
  replacement_guarantee_valid_until?: string;
  follow_up_status: 'pending_first_lesson' | 'first_lesson_completed' | 'ongoing_smooth' | 'issue_reported' | 'concluded';
  follow_up_notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface FeeConfiguration {
  id: string;
  default_commission_percentage: number; // 60.00
  applicable_basis: string; // 'first_month_lessons'
  failure_replacement_policy: string;
  repeat_client_policy: string;
  effective_from: string;
  is_active: boolean;
}

export interface Complaint {
  id: string;
  reference_number: string;
  reporter_type: 'parent' | 'tutor' | 'anonymous' | 'staff';
  reporter_name?: string;
  reporter_contact?: string;
  subject: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface DataDeletionRequest {
  id: string;
  reference_number: string;
  requester_name: string;
  requester_contact: string;
  request_type: 'deletion' | 'rectification' | 'data_export';
  details?: string;
  status: 'pending' | 'verified' | 'completed' | 'rejected';
  completed_at?: string;
  created_at: string;
}

export interface AdminMetrics {
  totalTutorApplications: number;
  pendingTutorReviews: number;
  approvedTutors: number;
  totalParentRequests: number;
  activeRequests: number;
  activeMatches: number;
  totalPlacements: number;
  totalPlacementValueETB: number;
  totalCommissionDueETB: number;
  totalCommissionPaidETB: number;
  openComplaints: number;
  // Vacancy stats
  totalVacancies: number;
  openVacancies: number;
  totalVacancyApplications: number;
  totalVacancyViews: number;
  // Telegram & Growth stats
  telegramSubscribers?: number;
  activeTelegramSubscribers?: number;
  telegramBroadcastsCount?: number;
  telegramAttributedRequests?: number;
  telegramAttributedTutors?: number;
  telegramAttributedVacancyApps?: number;
}

export type VacancyStatus = 
  | 'draft'
  | 'open'
  | 'closing_soon'
  | 'filled'
  | 'closed'
  | 'archived';

export type VacancyApplicationStatus = 
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview_discussion'
  | 'selected'
  | 'not_selected'
  | 'withdrawn';

export interface TutoringVacancy {
  id: string;
  vacancy_code: string; // e.g. BT-VAC-2026-0001
  title: string;
  parent_request_id?: string;
  
  // General location (Strictly no exact address)
  city: string;
  sub_city: string;
  general_area?: string;
  
  // Academic criteria
  grade_level: string;
  curriculum: string;
  subjects: string[];
  
  // Teaching format & timing
  teaching_format: TeachingMode;
  schedule_days: string[];
  time_window: string;
  lesson_frequency: string;
  hours_per_session: number;
  expected_duration_months: number;
  
  // Compensation
  hourly_rate_etb: number;
  total_estimated_budget_etb?: number;
  
  // Requirements & Preferences
  required_qualifications: string;
  languages: string[];
  parent_preferences?: string;
  
  // Deadline & instructions
  application_deadline?: string;
  application_instructions?: string;
  
  // Lifecycle
  status: VacancyStatus;
  
  // Growth & Distribution Metrics
  view_count: number;
  application_count: number;
  telegram_message_id?: string;
  telegram_published_at?: string;
  
  published_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VacancyApplication {
  id: string;
  vacancy_id: string;
  tutor_id?: string;
  
  applicant_name: string;
  applicant_phone: string;
  applicant_email?: string;
  applicant_education: string;
  applicant_institution: string;
  years_of_experience: number;
  
  proposed_rate_etb?: number;
  available_schedule?: string;
  cover_note: string;
  
  status: VacancyApplicationStatus;
  admin_review_notes?: string;
  
  referral_source?: string;
  utm_source?: string;
  utm_campaign?: string;
  
  created_at: string;
  updated_at: string;
}

export interface TelegramSubscriber {
  id: string;
  chat_id: number;
  username?: string;
  first_name?: string;
  is_active: boolean;
  subjects: string[];
  grade_levels: string[];
  sub_cities: string[];
  teaching_format: 'in_person' | 'online' | 'either';
  created_at: string;
  updated_at: string;
  last_alert_sent_at?: string;
}

export interface TelegramBroadcastLog {
  id: string;
  vacancy_id?: string;
  channel_id: string;
  message_id: string;
  broadcast_type: 'channel_announcement' | 'subscriber_alert' | 'custom_broadcast';
  recipient_count: number;
  status: 'published' | 'failed' | 'simulated';
  caption_snippet?: string;
  error_message?: string;
  created_at: string;
}

export interface TelegramStudioTemplate {
  id: string;
  key: string;
  title: string;
  category: 'vacancy' | 'tutor_recruitment' | 'parent_promo' | 'branding_educational';
  default_caption_en: string;
  default_caption_am?: string;
  call_to_action: string;
  target_url_path: string;
  default_campaign: string;
}
