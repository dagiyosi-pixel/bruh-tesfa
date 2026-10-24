'use client';

// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Mobile-First Weekly Availability Editor
// Timezone: Africa/Addis_Ababa (UTC+3, EAT)
// =============================================================================

import React, { useState } from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  WEEKDAYS,
  TimeInterval,
  WeeklyAvailability,
  timeStringToMinutes,
  minutesToTimeString,
  validateTimeInterval,
  mergeOverlappingIntervals,
  formatDayIntervals,
  getScheduleCompleteness,
} from '@/lib/availability';
import { ClockIcon, CheckCircleIcon, AlertTriangleIcon } from '@/components/Icons';

interface TutorAvailabilityEditorProps {
  initialAvailability?: WeeklyAvailability | null;
  onSave: (availability: WeeklyAvailability, blackoutDates: string[]) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

const PRESET_INTERVALS = [
  { label: 'Morning (09:00 - 12:00)', start: '09:00', end: '12:00' },
  { label: 'Afternoon (14:00 - 17:00)', start: '14:00', end: '17:00' },
  { label: 'Evening (17:30 - 20:30)', start: '17:30', end: '20:30' },
  { label: 'Weekend Full Day (10:00 - 16:00)', start: '10:00', end: '16:00' },
];

export default function TutorAvailabilityEditor({
  initialAvailability,
  onSave,
  isLoading = false,
  readOnly = false,
}: TutorAvailabilityEditorProps) {
  // Local schedule state: Map of Day -> TimeInterval[]
  const [schedule, setSchedule] = useState<{ [key in DayOfWeek]: TimeInterval[] }>(() => {
    const defaultSchedule: { [key in DayOfWeek]: TimeInterval[] } = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    if (initialAvailability?.schedule) {
      for (const day of DAYS_OF_WEEK) {
        if (initialAvailability.schedule[day]) {
          defaultSchedule[day] = [...(initialAvailability.schedule[day] || [])];
        }
      }
    }
    return defaultSchedule;
  });

  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');
  const [blackoutDates, setBlackoutDates] = useState<string[]>(
    initialAvailability?.blackout_dates || []
  );
  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [minDuration, setMinDuration] = useState<number>(
    initialAvailability?.min_lesson_duration_minutes || 60
  );
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<number>(
    initialAvailability?.max_weekly_hours || 20
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add a new interval to current day
  const handleAddInterval = (day: DayOfWeek, start: string = '16:00', end: string = '18:00') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const existing = schedule[day] || [];
    const newInv: TimeInterval = {
      start,
      end,
      mode: 'either',
      is_preferred: true,
    };
    const updated = [...existing, newInv];
    setSchedule({ ...schedule, [day]: updated });
  };

  // Remove an interval from current day
  const handleRemoveInterval = (day: DayOfWeek, index: number) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const existing = schedule[day] || [];
    const updated = existing.filter((_, idx) => idx !== index);
    setSchedule({ ...schedule, [day]: updated });
  };

  // Update a specific interval's start, end, or flags
  const handleUpdateInterval = (
    day: DayOfWeek,
    index: number,
    field: keyof TimeInterval,
    value: unknown
  ) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const existing = [...(schedule[day] || [])];
    if (existing[index]) {
      existing[index] = { ...existing[index], [field]: value };
      setSchedule({ ...schedule, [day]: existing });
    }
  };

  // Quick Action: Copy Monday to all Weekdays (Tue - Fri)
  const handleCopyMondayToWeekdays = () => {
    setErrorMessage(null);
    const mondayIntervals = schedule.Monday || [];
    if (mondayIntervals.length === 0) {
      setErrorMessage('Monday has no intervals to copy. Add an interval to Monday first.');
      return;
    }
    const updated = { ...schedule };
    for (const day of ['Tuesday', 'Wednesday', 'Thursday', 'Friday'] as DayOfWeek[]) {
      updated[day] = mondayIntervals.map((inv) => ({ ...inv }));
    }
    setSchedule(updated);
    setSuccessMessage('Copied Monday schedule to Tuesday, Wednesday, Thursday, and Friday.');
  };

  // Quick Action: Copy Monday to All Days (Tue - Sun)
  const handleCopyMondayToAllDays = () => {
    setErrorMessage(null);
    const mondayIntervals = schedule.Monday || [];
    if (mondayIntervals.length === 0) {
      setErrorMessage('Monday has no intervals to copy. Add an interval to Monday first.');
      return;
    }
    const updated = { ...schedule };
    for (const day of DAYS_OF_WEEK) {
      if (day !== 'Monday') {
        updated[day] = mondayIntervals.map((inv) => ({ ...inv }));
      }
    }
    setSchedule(updated);
    setSuccessMessage('Copied Monday schedule across all 7 days.');
  };

  // Quick Action: Clear Day
  const handleClearDay = (day: DayOfWeek) => {
    setSchedule({ ...schedule, [day]: [] });
  };

  // Blackout Date management
  const handleAddBlackoutDate = () => {
    if (!newBlackoutDate) return;
    if (blackoutDates.includes(newBlackoutDate)) {
      setErrorMessage('This date is already marked as unavailable.');
      return;
    }
    setBlackoutDates([...blackoutDates, newBlackoutDate].sort());
    setNewBlackoutDate('');
  };

  const handleRemoveBlackoutDate = (dateStr: string) => {
    setBlackoutDates(blackoutDates.filter((d) => d !== dateStr));
  };

  // Validate and submit
  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate intervals across all days
    const validatedSchedule: WeeklyAvailability['schedule'] = {};
    for (const day of DAYS_OF_WEEK) {
      const dayIntervals = schedule[day] || [];
      for (const inv of dayIntervals) {
        const val = validateTimeInterval(inv, minDuration);
        if (!val.isValid) {
          setActiveDay(day);
          setErrorMessage(`${day}: ${val.error}`);
          return;
        }
      }
      if (dayIntervals.length > 0) {
        validatedSchedule[day] = mergeOverlappingIntervals(dayIntervals);
      }
    }

    const payload: WeeklyAvailability = {
      timezone: 'Africa/Addis_Ababa',
      schedule: validatedSchedule,
      min_lesson_duration_minutes: minDuration,
      max_lesson_duration_minutes: 120,
      max_weekly_hours: maxWeeklyHours,
      blackout_dates: blackoutDates,
      updated_at: new Date().toISOString(),
    };

    try {
      await onSave(payload, blackoutDates);
      setSuccessMessage('Availability schedule saved and synchronized successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save availability';
      setErrorMessage(msg);
    }
  };

  // Calculate completeness summary
  const completeness = getScheduleCompleteness({
    timezone: 'Africa/Addis_Ababa',
    schedule,
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-50 border-b border-slate-200/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <ClockIcon className="w-3.5 h-3.5 text-amber-700" />
            <span>Addis Ababa Local Time (UTC+3, EAT)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Weekly Teaching Availability</h2>
          <p className="text-xs text-slate-500">
            Specify the days and hours when you are genuinely available for tutoring placements.
          </p>
        </div>

        {/* Schedule Completeness Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              completeness.level === 'full'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : completeness.level === 'basic'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-600 border border-slate-300'
            }`}
          >
            {completeness.label} • {completeness.totalWeeklyHours} hrs/wk ({completeness.availableDaysCount} days)
          </span>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="m-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
          <AlertTriangleIcon className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <strong>Schedule Validation Notice:</strong>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="m-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs">
          <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Day Tabs (Mobile Horizontal Scrollable) */}
      <div className="border-b border-slate-200 bg-slate-50/60 px-4 pt-3 overflow-x-auto scrollbar-none flex gap-1.5">
        {DAYS_OF_WEEK.map((day) => {
          const count = (schedule[day] || []).length;
          const isActive = activeDay === day;
          return (
            <button
              type="button"
              key={day}
              onClick={() => {
                setActiveDay(day);
                setErrorMessage(null);
              }}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all border-t border-x ${
                isActive
                  ? 'bg-white text-amber-950 border-slate-200 border-b-transparent shadow-xs -mb-px'
                  : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              {count > 0 ? (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-extrabold">
                  {count}
                </span>
              ) : (
                <span className="ml-1.5 text-[10px] text-slate-400 font-normal">Off</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Day Editor */}
      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {activeDay} Schedule
            </h3>
            <p className="text-xs text-slate-500">
              {(schedule[activeDay] || []).length === 0
                ? 'No teaching hours set for this day (Marked as unavailable).'
                : `${(schedule[activeDay] || []).length} available window(s) specified.`}
            </p>
          </div>

          {!readOnly && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddInterval(activeDay)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
              >
                + Add Time Interval
              </button>
              {(schedule[activeDay] || []).length > 0 && (
                <button
                  type="button"
                  onClick={() => handleClearDay(activeDay)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Clear Day
                </button>
              )}
            </div>
          )}
        </div>

        {/* Intervals List */}
        {(schedule[activeDay] || []).length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <ClockIcon className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-700">Unavailable on {activeDay}s</p>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
              If you can teach on {activeDay}s, add an interval below or choose a popular time preset.
            </p>

            {!readOnly && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {PRESET_INTERVALS.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => handleAddInterval(activeDay, preset.start, preset.end)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:border-amber-500 hover:text-amber-900 shadow-2xs"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(schedule[activeDay] || []).map((interval, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Time Pickers */}
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      disabled={readOnly}
                      value={interval.start}
                      onChange={(e) =>
                        handleUpdateInterval(activeDay, idx, 'start', e.target.value)
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <span className="text-slate-400 mt-5">&rarr;</span>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      disabled={readOnly}
                      value={interval.end}
                      onChange={(e) =>
                        handleUpdateInterval(activeDay, idx, 'end', e.target.value)
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Modality toggle */}
                  <div className="sm:ml-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Format
                    </label>
                    <select
                      disabled={readOnly}
                      value={interval.mode || 'either'}
                      onChange={(e) =>
                        handleUpdateInterval(activeDay, idx, 'mode', e.target.value)
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="either">In-Person or Online</option>
                      <option value="in_person">In-Person Only</option>
                      <option value="online">Online Only</option>
                    </select>
                  </div>
                </div>

                {/* Preference & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={interval.is_preferred !== false}
                      onChange={(e) =>
                        handleUpdateInterval(activeDay, idx, 'is_preferred', e.target.checked)
                      }
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Preferred Hours</span>
                  </label>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInterval(activeDay, idx)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                      Delete &times;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Copy Controls */}
        {!readOnly && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">Quick Schedule Tools:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyMondayToWeekdays}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 shadow-2xs"
              >
                Copy Monday to Weekdays (Mon-Fri)
              </button>
              <button
                type="button"
                onClick={handleCopyMondayToAllDays}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 shadow-2xs"
              >
                Copy Monday to All Days (Mon-Sun)
              </button>
            </div>
          </div>
        )}

        {/* Date-Specific Blackouts (Exams, Travel, Family commitments) */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Specific Blackout Dates (Temporarily Unavailable)
              </h4>
              <p className="text-[11px] text-slate-500">
                Mark specific dates (e.g. university exam weeks or travel) when you cannot teach.
              </p>
            </div>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={newBlackoutDate}
                onChange={(e) => setNewBlackoutDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 flex-1"
              />
              <button
                type="button"
                onClick={handleAddBlackoutDate}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white"
              >
                + Add Date
              </button>
            </div>
          )}

          {blackoutDates.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {blackoutDates.map((dateStr) => (
                <span
                  key={dateStr}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-800 border border-red-200"
                >
                  <span>{dateStr}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBlackoutDate(dateStr)}
                      className="text-red-500 hover:text-red-800 font-bold"
                    >
                      &times;
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Summary Card */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
            Weekly Schedule Summary
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="flex justify-between py-0.5 border-b border-amber-200/40">
                <span className="font-semibold">{d}:</span>
                <span className="text-right">{formatDayIntervals(schedule[d] || [])}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        {!readOnly && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSave}
              className="px-6 py-3 rounded-2xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-md disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Saving Schedule...' : 'Save Availability Schedule'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
