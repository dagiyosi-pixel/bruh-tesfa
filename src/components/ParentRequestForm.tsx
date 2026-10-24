'use client';

// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Progressive Parent Tutoring Request Form
// Designed for mobile accessibility, schedule precision, and child safeguarding.
// =============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SUB_CITIES_ADDIS_ABABA,
  POPULAR_NEIGHBORHOODS,
  SUBJECTS_TAXONOMY,
  GRADE_LEVELS,
  CURRICULA,
  TEACHING_LANGUAGES,
  BUDGET_TIERS,
} from '@/lib/constants';
import {
  DAYS_OF_WEEK,
  DayOfWeek,
} from '@/lib/availability';
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ClockIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  MapPinIcon,
} from './Icons';

interface ParentRequestFormProps {
  initialTutorId?: string;
  initialTutorName?: string;
}

export default function ParentRequestForm({ initialTutorId, initialTutorName }: ParentRequestFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    parent_name: '',
    phone: '',
    email: '',
    preferred_contact_method: 'Phone' as 'Phone' | 'Telegram' | 'WhatsApp',
    city: 'Addis Ababa',
    sub_city: '',
    general_area: '',
    target_tutor_id: initialTutorId || '',
    subjects: [] as string[],
    grade_level: '',
    curriculum: 'Ethiopian National Curriculum',
    teaching_mode: 'in_person' as 'in_person' | 'online' | 'hybrid',
    // Detailed Schedule Preferences
    preferred_days: [] as string[],
    preferred_time_windows: [] as string[],
    schedule_flexibility: 'flexible_windows' as 'strict_times' | 'flexible_windows' | 'weekends_only' | 'open_schedule',
    earliest_start_date: '',
    hours_per_session: 1.5,
    lessons_per_week: 3,
    schedule_preference: '', // Legacy string summary
    budget_range_min: 350,
    budget_range_max: 500,
    preferred_language: 'English & Amharic',
    learning_goals: '',
    privacy_consent: false,
    referral_source: 'Website Request Form',
  });

  const toggleSubject = (sub: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(sub)
        ? prev.subjects.filter((s) => s !== sub)
        : [...prev.subjects, sub],
    }));
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_days: prev.preferred_days.includes(day)
        ? prev.preferred_days.filter((d) => d !== day)
        : [...prev.preferred_days, day],
    }));
  };

  const toggleTimeWindow = (win: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_time_windows: prev.preferred_time_windows.includes(win)
        ? prev.preferred_time_windows.filter((w) => w !== win)
        : [...prev.preferred_time_windows, win],
    }));
  };

  const validateCurrentStep = (step: number): boolean => {
    setErrorMessage(null);

    if (step === 1) {
      if (formData.subjects.length === 0) {
        setErrorMessage('Please select at least one subject needed for tutoring.');
        return false;
      }
      if (!formData.grade_level) {
        setErrorMessage("Please select your student's current grade level.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.sub_city) {
        setErrorMessage('Please select your sub-city in Addis Ababa.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (formData.schedule_flexibility !== 'open_schedule' && formData.preferred_days.length === 0) {
        setErrorMessage('Please select at least one preferred day of the week, or choose "Completely Flexible".');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!formData.parent_name.trim() || formData.parent_name.trim().length < 3) {
        setErrorMessage('Please provide your name as parent or guardian.');
        return false;
      }
      if (!formData.phone.trim() || formData.phone.trim().length < 9) {
        setErrorMessage('Please provide a valid phone number so coordinators can reach you.');
        return false;
      }
      if (!formData.privacy_consent) {
        setErrorMessage('Consent to the safeguarding and privacy terms is required before submission.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep(4)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    // Build synthesized legacy string
    const summarySchedule = `${formData.preferred_days.join(', ')} (${formData.preferred_time_windows.join(', ') || 'Flexible hours'})`;
    const payload = {
      ...formData,
      schedule_preference: summarySchedule,
    };

    try {
      const res = await fetch('/api/request-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request');
      }

      router.push(`/request-tutor/confirmation?ref=${encodeURIComponent(data.reference_number)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your request';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto overflow-hidden">
      {/* Progress Bar Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-50 border-b border-slate-200/80 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest block">
              Step {currentStep} of 4
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {currentStep === 1 && 'Academics & Learning Goals'}
              {currentStep === 2 && 'Format & Addis Ababa Location'}
              {currentStep === 3 && 'Schedule & Timing Preferences'}
              {currentStep === 4 && 'Budget & Contact Details'}
            </h2>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2.5 rounded-full transition-all ${
                  step === currentStep
                    ? 'w-7 bg-amber-600'
                    : step < currentStep
                    ? 'w-2.5 bg-emerald-600'
                    : 'w-2.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {initialTutorName && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-100/70 border border-amber-300/80 flex items-center justify-between text-xs text-amber-950">
            <div>
              <span>Preferred Educator: </span>
              <strong>{initialTutorName}</strong>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 font-bold text-[10px]">
              Pre-selected
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="m-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
          <AlertTriangleIcon className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <strong>Please check the following:</strong>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">
        {/* STEP 1: Academics */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Subjects Needed <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS_TAXONOMY.map((sub) => {
                  const selected = formData.subjects.includes(sub);
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => toggleSubject(sub)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Grade Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">-- Choose Grade Level --</option>
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Curriculum
                </label>
                <select
                  value={formData.curriculum}
                  onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {CURRICULA.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Instruction Language
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="English & Amharic">English & Amharic (Bilingual)</option>
                <option value="English">English Only (for Cambridge/IB)</option>
                <option value="Amharic (አማርኛ)">Amharic (አማርኛ) Only</option>
                <option value="Afaan Oromoo">Afaan Oromoo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student Goals & Weak Areas (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.learning_goals}
                onChange={(e) => setFormData({ ...formData, learning_goals: e.target.value })}
                placeholder="e.g. Master calculus problems for EUEE exam; improve reading confidence..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Format & Location */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Teaching Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'in_person', title: 'In-Person Home Tutoring' },
                  { id: 'online', title: 'Online Tutoring' },
                  { id: 'hybrid', title: 'Either / Flexible' },
                ].map((mode) => (
                  <button
                    type="button"
                    key={mode.id}
                    onClick={() => setFormData({ ...formData, teaching_mode: mode.id as any })}
                    className={`p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      formData.teaching_mode === mode.id
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {mode.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sub-City (Addis Ababa) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sub_city}
                  onChange={(e) => setFormData({ ...formData, sub_city: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">-- Choose Sub-City --</option>
                  {SUB_CITIES_ADDIS_ABABA.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  General Neighborhood / Area
                </label>
                <input
                  type="text"
                  value={formData.general_area}
                  onChange={(e) => setFormData({ ...formData, general_area: e.target.value })}
                  placeholder="e.g. Bole Medhanialem, CMC near Sunshine"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Privacy reminder */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Safeguard:</strong> Please only provide a general landmark or neighborhood. Do not enter your exact house or apartment number during initial matching.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Schedule Preferences */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Preferred Days of the Week
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      preferred_days: ['Saturday', 'Sunday'],
                    }))
                  }
                  className="text-xs text-amber-700 hover:underline font-semibold"
                >
                  Weekends Only
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const selected = formData.preferred_days.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Windows */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Time Windows
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'Morning (09:00 - 12:00)', desc: '9am - 12pm' },
                  { id: 'Afternoon (14:00 - 17:00)', desc: '2pm - 5pm' },
                  { id: 'Evening (17:30 - 20:30)', desc: '5:30pm - 8:30pm' },
                ].map((win) => {
                  const selected = formData.preferred_time_windows.includes(win.id);
                  return (
                    <button
                      type="button"
                      key={win.id}
                      onClick={() => toggleTimeWindow(win.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{win.id.split(' ')[0]}</div>
                      <div className="text-[11px] text-slate-500">{win.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Flexibility Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Schedule Flexibility
              </label>
              <select
                value={formData.schedule_flexibility}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schedule_flexibility: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="flexible_windows">Flexible (Can adjust within general morning/afternoon windows)</option>
                <option value="strict_times">Strict (Student has specific extracurricular commitments)</option>
                <option value="weekends_only">Weekends Only</option>
                <option value="open_schedule">Completely Open / Mutually agreed timing</option>
              </select>
            </div>

            {/* Frequency and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lessons / Week
                </label>
                <select
                  value={formData.lessons_per_week}
                  onChange={(e) => setFormData({ ...formData, lessons_per_week: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value={2}>2 sessions / week</option>
                  <option value={3}>3 sessions / week (Standard)</option>
                  <option value={4}>4 sessions / week (Intensive)</option>
                  <option value={5}>5 sessions / week (Ministry Prep)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hours / Session
                </label>
                <select
                  value={formData.hours_per_session}
                  onChange={(e) => setFormData({ ...formData, hours_per_session: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value={1.0}>1.0 hour</option>
                  <option value={1.5}>1.5 hours (Recommended)</option>
                  <option value={2.0}>2.0 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Earliest Start Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={formData.earliest_start_date}
                  onChange={(e) => setFormData({ ...formData, earliest_start_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Budget & Contact & Final Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Review Summary Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                Request Summary Review
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs text-amber-900">
                <div>
                  <span className="text-slate-500">Subjects:</span>{' '}
                  <strong className="text-slate-900">{formData.subjects.join(', ')}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Grade:</span>{' '}
                  <strong className="text-slate-900">{formData.grade_level}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Location:</span>{' '}
                  <strong className="text-slate-900">{formData.sub_city} ({formData.general_area || 'General Area'})</strong>
                </div>
                <div>
                  <span className="text-slate-500">Schedule:</span>{' '}
                  <strong className="text-slate-900">
                    {formData.preferred_days.join(', ') || 'Flexible'} • {formData.lessons_per_week}x/wk ({formData.hours_per_session}h)
                  </strong>
                </div>
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Budget Range (ETB / hour)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="50"
                  min="200"
                  value={formData.budget_range_min}
                  onChange={(e) => setFormData({ ...formData, budget_range_min: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 font-bold"
                  placeholder="Min ETB"
                />
                <span className="text-slate-400 font-bold">&ndash;</span>
                <input
                  type="number"
                  step="50"
                  max="2000"
                  value={formData.budget_range_max}
                  onChange={(e) => setFormData({ ...formData, budget_range_max: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 font-bold"
                  placeholder="Max ETB"
                />
              </div>
            </div>

            {/* Parent Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parent / Guardian Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  placeholder="e.g. W/ro Selamawit Kebede"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +251 91 123 4567"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preferred Contact Channel
                </label>
                <select
                  value={formData.preferred_contact_method}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferred_contact_method: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Phone">Phone Call / SMS</option>
                  <option value="Telegram">Telegram</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            {/* Child Safeguarding & Legal Notice */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Child Safeguarding Requirement (Proc. No. 1321/2024):</strong>
                  <p className="mt-0.5 text-slate-600">
                    For all in-person tutoring sessions in private residences, an adult parent, guardian, or designated family member must be present in the home.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200/60">
                <input
                  type="checkbox"
                  checked={formData.privacy_consent}
                  onChange={(e) => setFormData({ ...formData, privacy_consent: e.target.checked })}
                  className="mt-1 rounded text-amber-600 focus:ring-amber-500"
                  required
                />
                <span className="text-xs text-slate-700">
                  I agree to Bruh Tesfa&apos;s privacy policy and consent to being contacted by a coordinator regarding tutor matching.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              &larr; Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Continue</span>
              <span>&rarr;</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Tutoring Request'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
