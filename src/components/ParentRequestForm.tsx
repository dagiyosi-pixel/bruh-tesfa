'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SUB_CITIES_ADDIS_ABABA,
  SUBJECTS_TAXONOMY,
  GRADE_LEVELS,
  CURRICULA,
  TEACHING_LANGUAGES,
  LESSON_FREQUENCIES,
  REFERRAL_SOURCES,
} from '@/lib/constants';
import { CheckCircleIcon, ShieldCheckIcon, AlertTriangleIcon, ArrowRightIcon } from './Icons';

interface ParentRequestFormProps {
  initialTutorId?: string;
  initialTutorName?: string;
}

export default function ParentRequestForm({ initialTutorId, initialTutorName }: ParentRequestFormProps) {
  const router = useRouter();
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
    schedule_preference: '',
    lesson_frequency: '3 days per week (standard recommendation)',
    budget_range_min: 350,
    budget_range_max: 500,
    preferred_language: 'English & Amharic',
    learning_goals: '',
    privacy_consent: false,
    referral_source: 'Website Form',
  });

  const toggleSubject = (sub: string) => {
    setFormData((prev) => {
      const exists = prev.subjects.includes(sub);
      return {
        ...prev,
        subjects: exists ? prev.subjects.filter((s) => s !== sub) : [...prev.subjects, sub],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.parent_name.trim()) {
      setErrorMessage('Please provide your name as parent or guardian.');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 9) {
      setErrorMessage('Please provide a valid phone number for coordination.');
      return;
    }

    if (!formData.sub_city) {
      setErrorMessage('Please choose your sub-city in Addis Ababa.');
      return;
    }

    if (formData.subjects.length === 0) {
      setErrorMessage('Please select at least one subject needed.');
      return;
    }

    if (!formData.grade_level) {
      setErrorMessage('Please select your student&apos;s current grade level.');
      return;
    }

    if (!formData.privacy_consent) {
      setErrorMessage('Consent to contact and the Privacy Notice is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/request-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm max-w-2xl mx-auto">
      {initialTutorName && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="text-xs text-amber-900">
            <span>Preferred Educator: </span>
            <strong className="text-sm font-bold text-amber-950">{initialTutorName}</strong>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
            Selected
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertTriangleIcon className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <strong>Submission Notice:</strong>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parent Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            Parent or Guardian Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Parent / Guardian Name <span className="text-red-500">*</span>
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
                Preferred Contact Method
              </label>
              <select
                value={formData.preferred_contact_method}
                onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value as 'Phone' | 'Telegram' | 'WhatsApp' })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
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
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Location in Addis Ababa */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            Location in Addis Ababa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sub-City <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sub_city}
                onChange={(e) => setFormData({ ...formData, sub_city: e.target.value })}
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
                General Area / Landmark
              </label>
              <input
                type="text"
                value={formData.general_area}
                onChange={(e) => setFormData({ ...formData, general_area: e.target.value })}
                placeholder="e.g. Near Medhanialem Church, CMC Michael"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-600">No exact house address required for initial match</span>
            </div>
          </div>
        </div>

        {/* Tutoring Needs */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            Student Learning Needs
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Subjects Needed <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUBJECTS_TAXONOMY.map((sub) => {
                const selected = formData.subjects.includes(sub);
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      selected
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
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
                required
              >
                <option value="">Select Grade Level...</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Teaching Modality
              </label>
              <select
                value={formData.teaching_mode}
                onChange={(e) => setFormData({ ...formData, teaching_mode: e.target.value as 'in_person' | 'online' | 'hybrid' })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="in_person">In-Person Home Tutoring</option>
                <option value="online">Online Tutoring</option>
                <option value="hybrid">Either (In-Person or Online)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lesson Frequency
              </label>
              <select
                value={formData.lesson_frequency}
                onChange={(e) => setFormData({ ...formData, lesson_frequency: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {LESSON_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Budget Range (ETB / hour)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="50"
                  value={formData.budget_range_min}
                  onChange={(e) => setFormData({ ...formData, budget_range_min: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  placeholder="Min"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  step="50"
                  value={formData.budget_range_max}
                  onChange={(e) => setFormData({ ...formData, budget_range_max: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Instruction Language
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="English & Amharic">English & Amharic (Standard)</option>
                <option value="Amharic Only">Amharic (አማርኛ) Only</option>
                <option value="English Only">English Only</option>
                <option value="Afaan Oromoo">Afaan Oromoo & English</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Specific Goals or Challenges (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.learning_goals}
              onChange={(e) => setFormData({ ...formData, learning_goals: e.target.value })}
              placeholder="e.g. Preparing for Grade 12 EUEE university entrance exam, needs active problem solving in calculus and chemistry..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Consent under Ethiopian Privacy Law */}
        <div className="pt-2">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacy_consent}
              onChange={(e) => setFormData({ ...formData, privacy_consent: e.target.checked })}
              className="w-4 h-4 mt-0.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              required
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I consent to Bruh Tesfa processing my contact information to propose matching tutors in accordance with the <strong>Ethiopian Personal Data Protection Proclamation No. 1321/2024</strong>. I understand that Bruh Tesfa does not charge parents any booking fee.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-base text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all disabled:opacity-50"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting Your Request...' : 'Submit Tutoring Request'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
