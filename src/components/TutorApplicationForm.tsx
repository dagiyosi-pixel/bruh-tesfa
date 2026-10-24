'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  SUB_CITIES_ADDIS_ABABA,
  SUBJECTS_TAXONOMY,
  GRADE_LEVELS,
  CURRICULA,
  TEACHING_LANGUAGES,
  REFERRAL_SOURCES,
} from '@/lib/constants';
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  GraduationCapIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
} from './Icons';

interface FormData {
  full_legal_name: string;
  public_display_name: string;
  phone: string;
  email: string;
  preferred_contact_channel: 'Telegram' | 'Phone' | 'WhatsApp';
  city: string;
  sub_city: string;
  specific_neighborhood: string;
  subjects: string[];
  grade_levels: string[];
  curricula: string[];
  education_level: string;
  institution: string;
  field_of_study: string;
  years_of_experience: number;
  teaching_approach: string;
  bio: string;
  teaching_languages: string[];
  available_days: string[];
  available_time_windows: string[];
  teaching_modes: ('in_person' | 'online')[];
  travel_areas: string[];
  hourly_rate_etb: number;
  privacy_consent: boolean;
  code_of_conduct_agreed: boolean;
  referral_source: string;
}

const STORAGE_KEY = 'bruh_tesfa_tutor_draft_v1';

export default function TutorApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    full_legal_name: '',
    public_display_name: '',
    phone: '',
    email: '',
    preferred_contact_channel: 'Telegram',
    city: 'Addis Ababa',
    sub_city: '',
    specific_neighborhood: '',
    subjects: [],
    grade_levels: [],
    curricula: ['Ethiopian National Curriculum'],
    education_level: 'B.Sc. / B.Ed. Graduate',
    institution: '',
    field_of_study: '',
    years_of_experience: 1,
    teaching_approach: '',
    bio: '',
    teaching_languages: ['English', 'Amharic (አማርኛ)'],
    available_days: ['Monday', 'Wednesday', 'Friday'],
    available_time_windows: ['Late Afternoon (4:00 PM - 7:00 PM)'],
    teaching_modes: ['in_person'],
    travel_areas: [],
    hourly_rate_etb: 400,
    privacy_consent: false,
    code_of_conduct_agreed: false,
    referral_source: 'Telegram Channel or Group',
  });

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // LocalStorage error or private window
    }
  }, []);

  // Save draft whenever formData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore storage quota errors
    }
  }, [formData]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = <K extends keyof FormData>(field: K, item: string) => {
    setFormData((prev) => {
      const arr = (prev[field] as unknown as string[]) || [];
      const updated = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
      return { ...prev, [field]: updated };
    });
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);

    if (step === 1) {
      if (!formData.full_legal_name.trim() || formData.full_legal_name.trim().length < 3) {
        setErrorMessage('Please enter your full legal name as it appears on your National ID or passport.');
        return false;
      }
      if (!formData.public_display_name.trim() || formData.public_display_name.trim().length < 2) {
        setErrorMessage('Please provide a preferred public display name (e.g. Teacher Dagmawi).');
        return false;
      }
      if (!formData.phone.trim() || formData.phone.trim().length < 9) {
        setErrorMessage('Please provide a valid phone number so coordinators can reach you.');
        return false;
      }
      if (!formData.sub_city) {
        setErrorMessage('Please select your current sub-city in Addis Ababa.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (formData.subjects.length === 0) {
        setErrorMessage('Please select at least one subject you are qualified to teach.');
        return false;
      }
      if (formData.grade_levels.length === 0) {
        setErrorMessage('Please select at least one target grade level.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!formData.institution.trim()) {
        setErrorMessage('Please specify your university or higher education institution.');
        return false;
      }
      if (!formData.field_of_study.trim()) {
        setErrorMessage('Please specify your academic major or field of study.');
        return false;
      }
      if (!formData.teaching_approach.trim() || formData.teaching_approach.trim().length < 30) {
        setErrorMessage('Please describe your teaching approach in at least 30 characters.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (formData.travel_areas.length === 0 && formData.teaching_modes.includes('in_person')) {
        setErrorMessage('Please select at least one sub-city where you can travel for in-person lessons.');
        return false;
      }
      if (Number(formData.hourly_rate_etb) < 150) {
        setErrorMessage('Please enter a reasonable hourly rate (minimum 150 ETB/hr).');
        return false;
      }
      return true;
    }

    if (step === 5) {
      if (!formData.privacy_consent) {
        setErrorMessage('You must consent to the Privacy Notice under Ethiopian Proclamation No. 1321/2024.');
        return false;
      }
      if (!formData.code_of_conduct_agreed) {
        setErrorMessage('You must review and agree to the Bruh Tesfa Tutor Code of Conduct.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
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
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tutor-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Clear draft
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      router.push(`/become-a-tutor/confirmation?ref=${encodeURIComponent(data.reference_number)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during submission';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm max-w-3xl mx-auto">
      {/* Multi-Step Progress Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          <span>Step {currentStep} of 5</span>
          <span>
            {currentStep === 1 && 'Personal & Contact'}
            {currentStep === 2 && 'Subjects & Grades'}
            {currentStep === 3 && 'Qualifications & Pedagogy'}
            {currentStep === 4 && 'Modality, Area & Rates'}
            {currentStep === 5 && 'Safeguarding & Consent'}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-amber-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertTriangleIcon className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <strong>Please check your submission:</strong>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Personal & Contact */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Personal & Contact Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your legal identity remains strictly private and is only used for administrative verification.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.full_legal_name}
                onChange={(e) => updateField('full_legal_name', e.target.value)}
                placeholder="e.g. Dagmawi Yosef Mesfin"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                required
              />
              <span className="text-[11px] text-slate-600">Must match your National ID / Passport</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Public Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.public_display_name}
                  onChange={(e) => updateField('public_display_name', e.target.value)}
                  placeholder="e.g. Teacher Dagmawi or Dagmawi Y."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                  required
                />
                <span className="text-[11px] text-slate-600">Shown publicly on your profile</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="e.g. +251 91 123 4567"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                  required
                />
                <span className="text-[11px] text-slate-600">Never published publicly</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preferred Contact Channel
                </label>
                <select
                  value={formData.preferred_contact_channel}
                  onChange={(e) => updateField('preferred_contact_channel', e.target.value as 'Telegram' | 'Phone' | 'WhatsApp')}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="Telegram">Telegram (Recommended)</option>
                  <option value="Phone">Direct Phone Call / SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Sub-City (Addis Ababa) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sub_city}
                  onChange={(e) => updateField('sub_city', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                >
                  <option value="">Select your sub-city...</option>
                  {SUB_CITIES_ADDIS_ABABA.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specific Neighborhood (Optional)
                </label>
                <input
                  type="text"
                  value={formData.specific_neighborhood}
                  onChange={(e) => updateField('specific_neighborhood', e.target.value)}
                  placeholder="e.g. Bole Atlas, CMC Michael, Sarbet"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Subjects & Grades */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Teaching Subjects & Grades</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select only the subjects and levels you have high academic competence in.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Subjects You Can Teach <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUBJECTS_TAXONOMY.map((sub) => {
                  const selected = formData.subjects.includes(sub);
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => toggleArrayItem('subjects', sub)}
                      className={`text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Target Grade Levels <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GRADE_LEVELS.map((grade) => {
                  const selected = formData.grade_levels.includes(grade);
                  return (
                    <button
                      type="button"
                      key={grade}
                      onClick={() => toggleArrayItem('grade_levels', grade)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Curriculum Familiarity
              </label>
              <div className="flex flex-wrap gap-2">
                {CURRICULA.map((curriculum) => {
                  const selected = formData.curricula.includes(curriculum);
                  return (
                    <button
                      type="button"
                      key={curriculum}
                      onClick={() => toggleArrayItem('curricula', curriculum)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        selected
                          ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {curriculum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Education & Experience */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Academic Background & Approach</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We verify degrees and higher diplomas before approving public visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Highest Education Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.education_level}
                  onChange={(e) => updateField('education_level', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                >
                  <option value="B.Sc. / B.Ed. Graduate">B.Sc. / B.Ed. Graduate</option>
                  <option value="B.A. Graduate">B.A. Graduate</option>
                  <option value="Current University Senior (AAU / ASTU)">Current University Senior (AAU / ASTU)</option>
                  <option value="M.Sc. / M.Ed. / Masters">M.Sc. / M.Ed. / Masters</option>
                  <option value="Certified Teacher (Ministry of Education)">Certified Teacher (Ministry of Education)</option>
                  <option value="Other Tertiary Degree">Other Tertiary Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  University / Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => updateField('institution', e.target.value)}
                  placeholder="e.g. Addis Ababa University (AAU)"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Field of Study / Major <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.field_of_study}
                  onChange={(e) => updateField('field_of_study', e.target.value)}
                  placeholder="e.g. Mechanical Engineering, Mathematics"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Years of Tutoring Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={formData.years_of_experience}
                  onChange={(e) => updateField('years_of_experience', Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Teaching Approach & Methodology <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.teaching_approach}
                onChange={(e) => updateField('teaching_approach', e.target.value)}
                placeholder="Explain how you assess a student's weak points, prepare diagnostic quizzes, and structure lessons..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                required
              />
              <span className="text-[11px] text-slate-600">Minimum 30 characters</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Short Educator Biography
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="A brief summary for parents reading your profile..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Languages You Can Teach In
              </label>
              <div className="flex flex-wrap gap-2">
                {TEACHING_LANGUAGES.map((lang) => {
                  const selected = formData.teaching_languages.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => toggleArrayItem('teaching_languages', lang)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Modality, Availability & Rates */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Teaching Mode, Travel & Rates</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set your realistic travel radius and expected rate in Ethiopian Birr (ETB).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Teaching Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toggleArrayItem('teaching_modes', 'in_person')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    formData.teaching_modes.includes('in_person')
                      ? 'bg-amber-50 border-amber-500 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  In-Person Home Tutoring
                </button>
                <button
                  type="button"
                  onClick={() => toggleArrayItem('teaching_modes', 'online')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    formData.teaching_modes.includes('online')
                      ? 'bg-amber-50 border-amber-500 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  Online Tutoring (Zoom/Meet/Telegram)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Days of the Week You Can Teach
              </label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const selected = formData.available_days.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleArrayItem('available_days', day)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                General Available Time Windows
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Morning (09:00 - 12:00)',
                  'Afternoon (14:00 - 17:00)',
                  'Evening (17:30 - 20:30)',
                  'Weekend Full Day (10:00 - 16:00)',
                ].map((win) => {
                  const selected = formData.available_time_windows.includes(win);
                  return (
                    <button
                      type="button"
                      key={win}
                      onClick={() => toggleArrayItem('available_time_windows', win)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {win}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                You can configure exact start/end hours and blackout dates anytime in the Tutor Portal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Sub-Cities You Are Willing to Travel To (In-Person)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUB_CITIES_ADDIS_ABABA.map((sc) => {
                  const selected = formData.travel_areas.includes(sc);
                  return (
                    <button
                      type="button"
                      key={sc}
                      onClick={() => toggleArrayItem('travel_areas', sc)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sc}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expected Hourly Rate (ETB / hour) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="150"
                  max="3000"
                  step="50"
                  value={formData.hourly_rate_etb}
                  onChange={(e) => updateField('hourly_rate_etb', Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                  required
                />
                <span className="text-[11px] text-slate-600">Standard range in Addis Ababa: 300 - 650 ETB/hr</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  How Did You Hear About Us?
                </label>
                <select
                  value={formData.referral_source}
                  onChange={(e) => updateField('referral_source', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {REFERRAL_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Verification, Fee Policy & Consent */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Safeguarding, Fee Policy & Consent</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review our placement commission terms and safeguarding commitments.
              </p>
            </div>

            {/* Transparent 60% Placement Fee Disclosure */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <h3 className="text-sm font-bold text-amber-950">
                  Transparent 60% Placement Fee Policy
                </h3>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Bruh Tesfa connects you with paying families without any upfront registration or listing fees. Upon a successful, agreed tutoring placement, Bruh Tesfa collects a one-time <strong>60% placement fee on your first month&apos;s contract value</strong>.
              </p>
              <ul className="text-xs text-amber-900 space-y-1 pl-4 list-disc">
                <li>You pay <strong>0 ETB</strong> to apply or join our network.</li>
                <li>The fee is payable only after your first agreed tutoring placement begins.</li>
                <li><strong>Months 2 onwards are 100% yours</strong>. Bruh Tesfa takes 0% commission on continuing lessons.</li>
              </ul>
            </div>

            {/* Ethiopian Privacy Law & Code of Conduct Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privacy_consent}
                  onChange={(e) => updateField('privacy_consent', e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  required
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I consent to the collection and administrative processing of my identity documents and contact details by Bruh Tesfa under the <strong>Ethiopian Personal Data Protection Proclamation No. 1321/2024</strong>. I understand my private documents will not be published publicly.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.code_of_conduct_agreed}
                  onChange={(e) => updateField('code_of_conduct_agreed', e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  required
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I agree to the <strong>Bruh Tesfa Tutor Code of Conduct</strong>: punctuality, professional boundaries, zero tolerance for harassment, and maintaining parental visibility during all home tutoring sessions involving minors.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Previous Step
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>{isSubmitting ? 'Submitting Application...' : 'Submit Tutor Application'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
