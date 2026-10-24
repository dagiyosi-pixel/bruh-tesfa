// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Algorithmic Candidate Matching Engine
// =============================================================================

import { ParentRequest, TutorApplication, TutorPublicProfile, CandidateMatch, MatchBreakdown } from './types';
import { evaluateScheduleCompatibility } from './availability';

/**
 * Calculates a transparent, explainable compatibility score (0-100)
 * between a parent's tutoring request and a tutor profile.
 */
export function evaluateCandidateMatch(
  request: ParentRequest,
  tutor: TutorApplication | TutorPublicProfile
): CandidateMatch {
  const breakdown: MatchBreakdown = {
    subject_score: 0,
    grade_score: 0,
    modality_score: 0,
    location_score: 0,
    language_score: 0,
    budget_score: 0,
    reasons: [],
  };

  // Eligibility check: unapproved or suspended tutors are ineligible
  const isApp = 'status' in tutor;
  const isEligible = isApp ? tutor.status === 'approved' : tutor.is_verified;

  if (!isEligible) {
    return {
      tutor,
      total_score: 0,
      breakdown: {
        ...breakdown,
        reasons: ['Tutor is not currently approved or is temporarily suspended'],
      },
      is_eligible: false,
    };
  }

  // 1. SUBJECT FIT (Max 30 points)
  const tutorSubjects = tutor.subjects.map((s) => s.toLowerCase());
  const requestedSubjects = request.subjects.map((s) => s.toLowerCase());
  
  if (requestedSubjects.length > 0) {
    const matchedSubjects = requestedSubjects.filter((reqSub) =>
      tutorSubjects.some((tutSub) => tutSub.includes(reqSub) || reqSub.includes(tutSub))
    );

    if (matchedSubjects.length > 0) {
      const ratio = matchedSubjects.length / requestedSubjects.length;
      breakdown.subject_score = Math.round(ratio * 30);
      breakdown.reasons.push(
        `+${breakdown.subject_score} pts: Teaches requested subject(s) (${matchedSubjects.join(', ')})`
      );
    } else {
      breakdown.reasons.push('0 pts: Does not list the primary requested subject');
    }
  } else {
    // If no specific subject was singled out, neutral default
    breakdown.subject_score = 15;
    breakdown.reasons.push('+15 pts: Broad curriculum match');
  }

  // 2. GRADE-LEVEL FIT (Max 20 points)
  const tutorGrades = tutor.grade_levels.map((g) => g.toLowerCase());
  const reqGrade = (request.grade_level || '').toLowerCase();
  
  const hasGradeMatch = tutorGrades.some((g) => {
    // Match numeric grade or level key
    if (reqGrade.includes('7-8') && g.includes('7-8')) return true;
    if (reqGrade.includes('9-10') && g.includes('9-10')) return true;
    if (reqGrade.includes('11-12') && g.includes('11-12')) return true;
    if (reqGrade.includes('1-4') && g.includes('1-4')) return true;
    if (reqGrade.includes('cambridge') && g.includes('cambridge')) return true;
    if (reqGrade.includes('ib') && g.includes('ib')) return true;
    return g.includes(reqGrade) || reqGrade.includes(g);
  });

  if (hasGradeMatch) {
    breakdown.grade_score = 20;
    breakdown.reasons.push(`+20 pts: Certified / experienced for ${request.grade_level}`);
  } else {
    breakdown.grade_score = 5;
    breakdown.reasons.push('5 pts: Partial grade range familiarity');
  }

  // 3. TEACHING MODALITY (Max 15 points)
  const tutorModes = tutor.teaching_modes;
  const reqMode = request.teaching_mode;

  if (tutorModes.includes(reqMode) || tutorModes.includes('hybrid')) {
    breakdown.modality_score = 15;
    breakdown.reasons.push(`+15 pts: Supports ${reqMode.replace('_', ' ')} format`);
  } else if (reqMode === 'hybrid' && (tutorModes.includes('in_person') || tutorModes.includes('online'))) {
    breakdown.modality_score = 10;
    breakdown.reasons.push('+10 pts: Available for one of requested hybrid components');
  } else {
    breakdown.modality_score = 0;
    breakdown.reasons.push(`0 pts: Modality mismatch (${tutorModes.join(', ')} vs ${reqMode})`);
  }

  // 4. SERVICE AREA / LOCATION PROXIMITY (Max 15 points)
  if (reqMode === 'online') {
    breakdown.location_score = 15;
    breakdown.reasons.push('+15 pts: Online session — location independent across Ethiopia');
  } else {
    const tutorAreas = ('travel_areas' in tutor ? tutor.travel_areas : tutor.service_areas) || [];
    const tutorSubcity = ('sub_city' in tutor ? tutor.sub_city : '') || '';
    const reqSubcity = request.sub_city.toLowerCase();

    const areaMatch = tutorAreas.some((a) => a.toLowerCase().includes(reqSubcity) || reqSubcity.includes(a.toLowerCase()))
      || tutorSubcity.toLowerCase().includes(reqSubcity);

    if (areaMatch) {
      breakdown.location_score = 15;
      breakdown.reasons.push(`+15 pts: Travels directly to or resides in ${request.sub_city}`);
    } else {
      breakdown.location_score = 4;
      breakdown.reasons.push(`4 pts: Outside primary travel sub-city (${request.sub_city})`);
    }
  }

  // 5. LANGUAGE PREFERENCE (Max 10 points)
  const tutorLanguages = ('teaching_languages' in tutor ? tutor.teaching_languages : tutor.languages) || [];
  const reqLang = (request.preferred_language || '').toLowerCase();

  const langMatch = tutorLanguages.some((l) => reqLang.includes(l.toLowerCase()) || l.toLowerCase().includes(reqLang));
  if (langMatch || reqLang === '' || reqLang.includes('either')) {
    breakdown.language_score = 10;
    breakdown.reasons.push(`+10 pts: Fluent in requested instruction language (${request.preferred_language})`);
  } else {
    breakdown.language_score = 5;
    breakdown.reasons.push('+5 pts: Partial language overlap');
  }

  // 6. BUDGET COMPATIBILITY (Max 10 points)
  const tutorRate = Number(tutor.hourly_rate_etb) || 350;
  const maxBudget = request.budget_range_max ? Number(request.budget_range_max) : 500;
  const minBudget = request.budget_range_min ? Number(request.budget_range_min) : 250;

  if (tutorRate >= minBudget && tutorRate <= maxBudget) {
    breakdown.budget_score = 10;
    breakdown.reasons.push(`+10 pts: Exact budget match (${tutorRate} ETB/hr within ${minBudget}-${maxBudget} ETB)`);
  } else if (tutorRate <= maxBudget + 100) {
    breakdown.budget_score = 6;
    breakdown.reasons.push(`+6 pts: Slight rate divergence (${tutorRate} ETB vs target ${maxBudget} ETB/hr)`);
  } else {
    breakdown.budget_score = 2;
    breakdown.reasons.push(`+2 pts: Exceeds specified family budget (${tutorRate} ETB/hr)`);
  }

  // 7. SCHEDULE COMPATIBILITY
  const weeklyAvailability = 'weekly_availability' in tutor ? tutor.weekly_availability : undefined;
  const legacyDays = 'available_days' in tutor ? tutor.available_days : undefined;

  const scheduleResult = evaluateScheduleCompatibility(
    {
      preferred_days: request.preferred_days,
      preferred_time_windows: request.preferred_time_windows,
      schedule_flexibility: request.schedule_flexibility,
      schedule_preference: request.schedule_preference,
    },
    weeklyAvailability,
    legacyDays
  );

  breakdown.schedule_score = scheduleResult.score;
  breakdown.schedule_status = scheduleResult.status;
  breakdown.schedule_explanation = scheduleResult.explanation;
  breakdown.reasons.push(scheduleResult.explanation);

  let total_score = Math.min(
    100,
    breakdown.subject_score +
    breakdown.grade_score +
    breakdown.modality_score +
    breakdown.location_score +
    breakdown.language_score +
    breakdown.budget_score
  );

  // If a parent has strict schedule requirements and tutor conflicts, apply a sharp penalty
  if (scheduleResult.status === 'conflict' && request.schedule_flexibility === 'strict_times') {
    total_score = Math.max(0, total_score - 25);
  }

  return {
    tutor,
    total_score,
    breakdown,
    schedule_status: scheduleResult.status,
    is_eligible: true,
  };
}

/**
 * Ranks all approved tutors for a given parent request in descending order of compatibility score.
 */
export function rankCandidatesForRequest(
  request: ParentRequest,
  tutors: (TutorApplication | TutorPublicProfile)[]
): CandidateMatch[] {
  return tutors
    .map((tutor) => evaluateCandidateMatch(request, tutor))
    .filter((match) => match.is_eligible)
    .sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }
      // Prefer compatible schedule over unknown/conflict
      const statusWeight = (s?: string) => (s === 'compatible' ? 3 : s === 'partially_compatible' ? 2 : s === 'unknown' ? 1 : 0);
      return statusWeight(b.schedule_status) - statusWeight(a.schedule_status);
    });
}
