'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TutoringVacancy } from '@/lib/types';
import { CheckCircleIcon, AlertTriangleIcon, ArrowRightIcon } from './Icons';

interface VacancyApplicationFormProps {
  vacancy: TutoringVacancy;
}

export default function VacancyApplicationForm({ vacancy }: VacancyApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tutor_id: '',
    applicant_name: '',
    applicant_phone: '',
    applicant_email: '',
    applicant_education: 'B.Sc. / B.Ed. Graduate',
    applicant_institution: '',
    years_of_experience: 2,
    proposed_rate_etb: vacancy.hourly_rate_etb,
    available_schedule: `Available for ${vacancy.lesson_frequency} (${vacancy.time_window || 'Afternoon'})`,
    cover_note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.applicant_name.trim() || formData.applicant_name.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.applicant_phone.trim() || formData.applicant_phone.trim().length < 9) {
      setErrorMessage('Please provide a valid phone number for coordination.');
      return;
    }

    if (!formData.applicant_institution.trim()) {
      setErrorMessage('Please specify your university or higher education institution.');
      return;
    }

    if (!formData.cover_note.trim() || formData.cover_note.trim().length < 20) {
      setErrorMessage('Please describe your teaching approach for this role (minimum 20 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/vacancies/${vacancy.vacancy_code}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application');
      }

      router.push(`/vacancies/${vacancy.vacancy_code}/confirmation?ref=${encodeURIComponent(vacancy.vacancy_code)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during submission';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (vacancy.status !== 'open' && vacancy.status !== 'closing_soon') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-2">
        <h3 className="font-bold text-slate-800 text-base">Applications Closed</h3>
        <p className="text-xs text-slate-500">
          This vacancy has been marked as <strong>{vacancy.status}</strong> and is no longer accepting new submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Quick Application
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Apply for this Vacancy ({vacancy.vacancy_code})
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          If you are already a registered Bruh Tesfa tutor, enter your registered phone number to link your profile.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
          <AlertTriangleIcon className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.applicant_name}
              onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
              placeholder="e.g. Teacher Abebe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number (Telegram) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.applicant_phone}
              onChange={(e) => setFormData({ ...formData, applicant_phone: e.target.value })}
              placeholder="e.g. 0911223344 or 0931736692"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Degree / Qualification <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.applicant_education}
              onChange={(e) => setFormData({ ...formData, applicant_education: e.target.value })}
              placeholder="e.g. B.Sc. Physics / Mechanical Eng."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              University / Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.applicant_institution}
              onChange={(e) => setFormData({ ...formData, applicant_institution: e.target.value })}
              placeholder="e.g. Addis Ababa University (AAU)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tutoring Experience (Years)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={formData.years_of_experience}
              onChange={(e) => setFormData({ ...formData, years_of_experience: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Agreed Rate (ETB / hour)
            </label>
            <input
              type="number"
              value={formData.proposed_rate_etb}
              onChange={(e) => setFormData({ ...formData, proposed_rate_etb: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Schedule Availability Confirmation
          </label>
          <input
            type="text"
            value={formData.available_schedule}
            onChange={(e) => setFormData({ ...formData, available_schedule: e.target.value })}
            placeholder="Confirm you can attend the requested days/times..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Why are you well-suited for this student? <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.cover_note}
            onChange={(e) => setFormData({ ...formData, cover_note: e.target.value })}
            placeholder="Mention your experience with this specific grade/curriculum, past student exam outcomes, and your proximity to the location..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 text-sm"
            required
          />
          <span className="text-[11px] text-slate-500">Minimum 20 characters</span>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all disabled:opacity-50"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting Application...' : 'Submit Vacancy Application'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
