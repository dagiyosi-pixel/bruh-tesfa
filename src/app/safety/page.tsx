'use client';

import React, { useState } from 'react';
import { ShieldCheckIcon, AlertTriangleIcon, CheckCircleIcon, ArrowRightIcon } from '@/components/Icons';

export default function SafetyPage() {
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportRef, setReportRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [complaintForm, setComplaintForm] = useState({
    reporter_type: 'parent' as 'parent' | 'tutor' | 'anonymous',
    reporter_name: '',
    reporter_contact: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent_safeguarding',
  });

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setReportSubmitted(true);
      setReportRef(data.reference_number);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Safeguarding & Integrity
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Safety, Screening & Trust
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          How Bruh Tesfa protects students, empowers parents, and ensures ethical tutoring standards across Addis Ababa.
        </p>
      </div>

      {/* 4 Pillars of Safety */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">1. Real Credential Authentication</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We inspect Ethiopian National ID cards (Fayda, Kebele, or Passport) and official degree credentials from accredited universities (AAU, ASTU, etc.). We do not approve anonymous or unverified applicants.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <CheckCircleIcon className="w-8 h-8 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">2. Mandatory Parental Presence</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            For home tutoring sessions involving minors, a parent or adult guardian must remain present in the home or conduct sessions in an open, visible study area. Tutors are explicitly prohibited from private, locked-room sessions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <ShieldCheckIcon className="w-8 h-8 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-900">3. Child Privacy & Data Protection</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Under Ethiopian Personal Data Protection Proclamation No. 1321/2024, Bruh Tesfa strictly never publishes children&apos;s photos, full names, birth dates, or exact residential addresses.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <AlertTriangleIcon className="w-8 h-8 text-red-600" />
          <h2 className="text-lg font-bold text-slate-900">4. Zero-Tolerance Code of Conduct</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Any report of harassment, inappropriate language, dishonesty regarding qualifications, or unexplained unpunctuality results in immediate suspension and operator review.
          </p>
        </div>
      </div>

      {/* Honest Disclosure Notice */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-xs sm:text-sm text-amber-950 leading-relaxed space-y-2">
        <h2 className="font-bold text-base">Important Safeguarding Notice</h2>
        <p>
          While Bruh Tesfa verifies identity and educational credentials, we are an independent placement service and not the legal employer of the tutors. Parents and guardians retain ultimate responsibility for household safety, monitoring lesson progress, and ensuring a safe learning environment.
        </p>
      </div>

      {/* Incident / Concern Reporting Form */}
      <div id="report" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs max-w-2xl mx-auto space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            Direct Safeguarding Channel
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Report a Concern or Incident
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            All reports are investigated directly by Bruh Tesfa management. You may report anonymously if preferred.
          </p>
        </div>

        {reportSubmitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircleIcon className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-lg text-emerald-950">Report Logged Successfully</h3>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
              Your concern has been transmitted directly to our Safeguarding Officer. Tracking Reference: <strong>{reportRef}</strong>. We will review and act immediately.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  You are a:
                </label>
                <select
                  value={complaintForm.reporter_type}
                  onChange={(e) => setComplaintForm({ ...complaintForm, reporter_type: e.target.value as 'parent' | 'tutor' | 'anonymous' })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="parent">Parent or Guardian</option>
                  <option value="tutor">Tutor</option>
                  <option value="anonymous">Prefer to remain anonymous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Urgency / Priority
                </label>
                <select
                  value={complaintForm.priority}
                  onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent_safeguarding' })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="medium">Medium (General Concern)</option>
                  <option value="high">High (Unpunctuality / Professional Breach)</option>
                  <option value="urgent_safeguarding">Urgent Safeguarding Concern</option>
                  <option value="low">Low (Feedback / Inquiry)</option>
                </select>
              </div>
            </div>

            {complaintForm.reporter_type !== 'anonymous' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={complaintForm.reporter_name}
                    onChange={(e) => setComplaintForm({ ...complaintForm, reporter_name: e.target.value })}
                    placeholder="e.g. Ato Dawit"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Phone or Telegram
                  </label>
                  <input
                    type="text"
                    value={complaintForm.reporter_contact}
                    onChange={(e) => setComplaintForm({ ...complaintForm, reporter_contact: e.target.value })}
                    placeholder="e.g. +251 91 123 4567"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject of Concern <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={complaintForm.subject}
                onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                placeholder="e.g. Tutor missed 2 consecutive sessions without notice"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={complaintForm.description}
                onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                placeholder="Please describe what happened, dates, and elements involved..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Logging Confidential Report...' : 'Submit Confidential Concern'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
