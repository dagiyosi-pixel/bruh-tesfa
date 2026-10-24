// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Structured Availability & Schedule Matching Engine
// Timezone: Africa/Addis_Ababa (UTC+3, EAT - East Africa Time, No Daylight Saving)
// =============================================================================

export const ETHIOPIA_TIMEZONE = 'Africa/Addis_Ababa';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WEEKDAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const WEEKENDS: DayOfWeek[] = ['Saturday', 'Sunday'];

export interface TimeInterval {
  start: string; // 'HH:mm' 24-hour format, e.g. '14:00'
  end: string;   // 'HH:mm' 24-hour format, e.g. '16:30'
  mode?: 'in_person' | 'online' | 'either';
  service_areas?: string[];
  is_preferred?: boolean;
}

export interface DaySchedule {
  day: DayOfWeek;
  is_enabled: boolean;
  intervals: TimeInterval[];
}

export type WeeklyAvailabilityMap = {
  [key in DayOfWeek]?: TimeInterval[];
};

export interface WeeklyAvailability {
  timezone: string; // 'Africa/Addis_Ababa'
  schedule: WeeklyAvailabilityMap;
  min_lesson_duration_minutes?: number; // default 60
  max_lesson_duration_minutes?: number; // default 120
  max_weekly_hours?: number;            // default 20
  blackout_dates?: string[];            // ['YYYY-MM-DD']
  extra_dates?: { date: string; intervals: TimeInterval[] }[];
  updated_at?: string;
}

export type ScheduleCompatibilityStatus =
  | 'compatible'
  | 'partially_compatible'
  | 'unknown'
  | 'conflict';

export interface ScheduleEvaluationResult {
  status: ScheduleCompatibilityStatus;
  score: number; // 0 to 15 points
  matchedDays: DayOfWeek[];
  conflictingDays: DayOfWeek[];
  explanation: string;
  isSpecificConfirmationNeeded: boolean;
}

// -----------------------------------------------------------------------------
// Time & Interval Utilities
// -----------------------------------------------------------------------------

/**
 * Parses 'HH:mm' into minutes from midnight (0 to 1439).
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return -1;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return -1;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return -1;
  }
  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight into 'HH:mm'.
 */
export function minutesToTimeString(minutes: number): string {
  const bounded = Math.max(0, Math.min(1439, Math.floor(minutes)));
  const h = Math.floor(bounded / 60);
  const m = bounded % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Validates a single time interval.
 */
export function validateTimeInterval(
  interval: TimeInterval,
  minDurationMinutes: number = 30
): { isValid: boolean; error?: string } {
  if (!interval || !interval.start || !interval.end) {
    return { isValid: false, error: 'Start and end time are required' };
  }

  const startMins = timeStringToMinutes(interval.start);
  const endMins = timeStringToMinutes(interval.end);

  if (startMins === -1) {
    return { isValid: false, error: `Invalid start time format: "${interval.start}". Use HH:mm (e.g. 14:00)` };
  }
  if (endMins === -1) {
    return { isValid: false, error: `Invalid end time format: "${interval.end}". Use HH:mm (e.g. 16:30)` };
  }
  if (startMins >= endMins) {
    return { isValid: false, error: `End time (${interval.end}) must be after start time (${interval.start})` };
  }

  const duration = endMins - startMins;
  if (duration < minDurationMinutes) {
    return {
      isValid: false,
      error: `Lesson interval must be at least ${minDurationMinutes} minutes (current: ${duration} mins)`,
    };
  }

  return { isValid: true };
}

/**
 * Sorts intervals chronologically and merges overlapping or contiguous intervals.
 */
export function mergeOverlappingIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (!intervals || intervals.length <= 1) return intervals || [];

  const valid = intervals
    .map((inv) => ({
      ...inv,
      startMins: timeStringToMinutes(inv.start),
      endMins: timeStringToMinutes(inv.end),
    }))
    .filter((inv) => inv.startMins !== -1 && inv.endMins !== -1 && inv.startMins < inv.endMins)
    .sort((a, b) => a.startMins - b.startMins);

  if (valid.length <= 1) {
    return valid.map(({ startMins, endMins, ...rest }) => rest);
  }

  const merged: Array<{
    startMins: number;
    endMins: number;
    mode?: 'in_person' | 'online' | 'either';
    service_areas?: string[];
    is_preferred?: boolean;
  }> = [];

  let current = valid[0];

  for (let i = 1; i < valid.length; i++) {
    const next = valid[i];

    // If next interval starts before or exactly when current ends, merge them
    if (next.startMins <= current.endMins) {
      current.endMins = Math.max(current.endMins, next.endMins);
      // Combine modes and areas if applicable
      if (next.is_preferred) current.is_preferred = true;
      if (next.service_areas && current.service_areas) {
        current.service_areas = Array.from(new Set([...current.service_areas, ...next.service_areas]));
      }
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  return merged.map((m) => ({
    start: minutesToTimeString(m.startMins),
    end: minutesToTimeString(m.endMins),
    mode: m.mode,
    service_areas: m.service_areas,
    is_preferred: m.is_preferred,
  }));
}

/**
 * Checks whether two time intervals overlap by at least minimumOverlapMinutes.
 */
export function intervalsOverlap(
  invA: { start: string; end: string },
  invB: { start: string; end: string },
  minOverlapMinutes: number = 30
): boolean {
  const startA = timeStringToMinutes(invA.start);
  const endA = timeStringToMinutes(invA.end);
  const startB = timeStringToMinutes(invB.start);
  const endB = timeStringToMinutes(invB.end);

  if (startA === -1 || endA === -1 || startB === -1 || endB === -1) return false;

  const overlapStart = Math.max(startA, startB);
  const overlapEnd = Math.min(endA, endB);

  return overlapEnd - overlapStart >= minOverlapMinutes;
}

// -----------------------------------------------------------------------------
// Schedule Completeness & Formatting
// -----------------------------------------------------------------------------

export function getScheduleCompleteness(weeklyAvailability?: WeeklyAvailability | null): {
  level: 'full' | 'basic' | 'none';
  label: string;
  totalWeeklyHours: number;
  availableDaysCount: number;
} {
  if (!weeklyAvailability || !weeklyAvailability.schedule) {
    return { level: 'none', label: 'No Schedule', totalWeeklyHours: 0, availableDaysCount: 0 };
  }

  const days = Object.keys(weeklyAvailability.schedule) as DayOfWeek[];
  let totalMinutes = 0;
  let activeDays = 0;

  for (const day of days) {
    const intervals = weeklyAvailability.schedule[day] || [];
    if (intervals.length > 0) {
      activeDays++;
      for (const inv of intervals) {
        const s = timeStringToMinutes(inv.start);
        const e = timeStringToMinutes(inv.end);
        if (s !== -1 && e > s) {
          totalMinutes += e - s;
        }
      }
    }
  }

  const totalWeeklyHours = Math.round((totalMinutes / 60) * 10) / 10;

  if (activeDays >= 3 && totalWeeklyHours >= 6) {
    return { level: 'full', label: 'Full Schedule', totalWeeklyHours, availableDaysCount: activeDays };
  } else if (activeDays > 0) {
    return { level: 'basic', label: 'Basic Schedule', totalWeeklyHours, availableDaysCount: activeDays };
  }

  return { level: 'none', label: 'No Schedule', totalWeeklyHours: 0, availableDaysCount: 0 };
}

/**
 * Formats a day's intervals into a concise, readable summary (e.g. '14:00-16:00, 18:00-20:00')
 */
export function formatDayIntervals(intervals: TimeInterval[]): string {
  if (!intervals || intervals.length === 0) return 'Unavailable';
  return intervals.map((inv) => `${inv.start} - ${inv.end}`).join(', ');
}

// -----------------------------------------------------------------------------
// Schedule Matching Engine
// -----------------------------------------------------------------------------

/**
 * Evaluates schedule compatibility between a parent request and a tutor's availability.
 */
export function evaluateScheduleCompatibility(
  parentSchedule: {
    preferred_days?: string[];
    preferred_time_windows?: string[];
    schedule_flexibility?: 'strict_times' | 'flexible_windows' | 'weekends_only' | 'open_schedule' | string;
    schedule_preference?: string; // Legacy string
  },
  tutorAvailability?: WeeklyAvailability | null,
  legacyTutorDays?: string[]
): ScheduleEvaluationResult {
  const reqFlexibility = parentSchedule.schedule_flexibility || 'flexible_windows';
  const reqDays = (parentSchedule.preferred_days || []).filter((d) => DAYS_OF_WEEK.includes(d as DayOfWeek)) as DayOfWeek[];

  // If tutor has no structured weekly availability
  const hasStructured = Boolean(
    tutorAvailability &&
    tutorAvailability.schedule &&
    Object.values(tutorAvailability.schedule).some((invs) => invs && invs.length > 0)
  );

  // Fallback to legacy string days if structured not present
  if (!hasStructured) {
    const tutorDays = legacyTutorDays || [];
    if (tutorDays.length === 0) {
      return {
        status: 'unknown',
        score: 5, // Neutral baseline for unconfigured tutors
        matchedDays: [],
        conflictingDays: reqDays,
        explanation: 'Schedule unknown: Tutor has not submitted detailed weekly hours. Coordinator must verify.',
        isSpecificConfirmationNeeded: true,
      };
    }

    if (reqDays.length === 0 || reqFlexibility === 'open_schedule') {
      return {
        status: 'partially_compatible',
        score: 10,
        matchedDays: tutorDays as DayOfWeek[],
        conflictingDays: [],
        explanation: `Open schedule: Tutor available on ${tutorDays.join(', ')}. Times require confirmation.`,
        isSpecificConfirmationNeeded: true,
      };
    }

    const overlapDays = reqDays.filter((d) => tutorDays.includes(d));
    if (overlapDays.length > 0) {
      const isFullDaysOverlap = overlapDays.length === reqDays.length;
      return {
        status: isFullDaysOverlap ? 'compatible' : 'partially_compatible',
        score: isFullDaysOverlap ? 12 : 8,
        matchedDays: overlapDays,
        conflictingDays: reqDays.filter((d) => !tutorDays.includes(d)),
        explanation: `Day match: Available on ${overlapDays.join(', ')}. Exact time intervals must be confirmed.`,
        isSpecificConfirmationNeeded: true,
      };
    }

    return {
      status: reqFlexibility === 'strict_times' ? 'conflict' : 'partially_compatible',
      score: reqFlexibility === 'strict_times' ? 0 : 4,
      matchedDays: [],
      conflictingDays: reqDays,
      explanation: `No overlapping days found between requested (${reqDays.join(', ')}) and tutor (${tutorDays.join(', ')}).`,
      isSpecificConfirmationNeeded: true,
    };
  }

  const scheduleMap = tutorAvailability!.schedule;

  // Case 1: Family is open or did not specify days
  if (reqDays.length === 0 || reqFlexibility === 'open_schedule') {
    const activeDays = DAYS_OF_WEEK.filter((d) => (scheduleMap[d] || []).length > 0);
    return {
      status: 'compatible',
      score: 15,
      matchedDays: activeDays,
      conflictingDays: [],
      explanation: `Flexible family schedule: Tutor has active availability on ${activeDays.length} days/week (${activeDays.slice(0, 3).join(', ')}${activeDays.length > 3 ? '...' : ''}).`,
      isSpecificConfirmationNeeded: false,
    };
  }

  // Parse requested time windows (e.g. ['Afternoon', '14:00 - 17:00'])
  const timeWindows = parentSchedule.preferred_time_windows || [];
  const parsedReqWindows: Array<{ start: string; end: string }> = [];

  for (const tw of timeWindows) {
    const lower = tw.toLowerCase();
    if (lower.includes('morning')) {
      parsedReqWindows.push({ start: '08:30', end: '12:00' });
    } else if (lower.includes('afternoon')) {
      parsedReqWindows.push({ start: '13:30', end: '17:00' });
    } else if (lower.includes('evening')) {
      parsedReqWindows.push({ start: '17:00', end: '20:30' });
    } else {
      // Check if format is 'HH:mm - HH:mm'
      const match = tw.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
      if (match) {
        parsedReqWindows.push({ start: match[1], end: match[2] });
      }
    }
  }

  const matchedDays: DayOfWeek[] = [];
  const conflictingDays: DayOfWeek[] = [];

  for (const day of reqDays) {
    const tutorIntervals = scheduleMap[day] || [];
    if (tutorIntervals.length === 0) {
      conflictingDays.push(day);
      continue;
    }

    if (parsedReqWindows.length === 0) {
      // Day is available and no specific window was requested
      matchedDays.push(day);
    } else {
      // Check if any tutor interval overlaps with any requested window
      const hasWindowOverlap = tutorIntervals.some((tutorInv) =>
        parsedReqWindows.some((reqWin) => intervalsOverlap(tutorInv, reqWin, 30))
      );

      if (hasWindowOverlap) {
        matchedDays.push(day);
      } else {
        conflictingDays.push(day);
      }
    }
  }

  // Determine overall status
  if (matchedDays.length === reqDays.length) {
    return {
      status: 'compatible',
      score: 15,
      matchedDays,
      conflictingDays: [],
      explanation: `Fully schedule-compatible: Available on all requested days (${matchedDays.join(', ')}) in requested time windows.`,
      isSpecificConfirmationNeeded: false,
    };
  }

  if (matchedDays.length > 0) {
    return {
      status: 'partially_compatible',
      score: 10,
      matchedDays,
      conflictingDays,
      explanation: `Partial schedule match: Available on ${matchedDays.join(', ')}, but conflicting on ${conflictingDays.join(', ')}.`,
      isSpecificConfirmationNeeded: true,
    };
  }

  // Zero matched days
  return {
    status: reqFlexibility === 'strict_times' ? 'conflict' : 'partially_compatible',
    score: reqFlexibility === 'strict_times' ? 0 : 3,
    matchedDays: [],
    conflictingDays,
    explanation: `Schedule conflict: Tutor has no matching intervals on requested ${conflictingDays.join(', ')}.`,
    isSpecificConfirmationNeeded: true,
  };
}
