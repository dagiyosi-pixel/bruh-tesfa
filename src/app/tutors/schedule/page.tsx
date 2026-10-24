'use client';

// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Tutor Self-Service Availability & Status Portal
// =============================================================================

import React, { useState } from 'react';
import TutorAvailabilityEditor from '@/components/TutorAvailabilityEditor';
import { WeeklyAvailability } from '@/lib/availability';
import { ShieldCheckIcon, ClockIcon, AlertTriangleIcon, CheckCircleIcon } from '@/components/Icons';
import Link from 'next/link';

interface TutorPortalState {
  id: string;
  reference_number: string;
  public_display_name: string;
  status: string;
  subjects: string[];
  grade_levels: string[];
  weekly_availability?: WeeklyAvailability;
  blackout_dates?: string[];
  availability_confirmed_at?: string;
  hourly_rate_etb: number;
}

export default function TutorSchedulePortalPage() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [tutorData, setTutorData] = useState<TutorPortalState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Authenticate and lookup profile
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/tutors/portal/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceNumber, phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      setTutorData(data.tutor);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid reference or phone number';
      setAuthError(msg);
      setTutorData(null);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Save updated schedule
  const handleSaveAvailability = async (
    availability: WeeklyAvailability,
    blackoutDates: string[]
  ) => {
    if (!tutorData) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/tutors/portal/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: tutorData.reference_number,
          phone,
          weeklyAvailability: availability,
          blackoutDates,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save schedule');
      }

      setTutorData((prev) =>
        prev
          ? {
              ...prev,
              weekly_availability: availability,
              blackout_dates: blackoutDates,
            }
          : null
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <ClockIcon className="w-3.5 h-3.5 text-amber-700" />
          <span>Educator Self-Service Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Manage Your Teaching Schedule
        </h1>
        <p className="text-sm text-slate-600">
          Update your weekly teaching hours, add blackout dates, and keep your placement eligibility up to date.
        </p>
      </div>

      {/* Authentication Card (if not logged in) */}
      {!tutorData ? (
        <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Verify Your Identity</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your Bruh Tesfa reference code and phone number to access your schedule.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application Reference Number
              </label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. BT-TUT-2026-0001"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registered Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +251 91 189 4521"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-sm disabled:opacity-50 transition-all"
            >
              {isAuthenticating ? 'Verifying...' : 'Access My Schedule &rarr;'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>New tutor? </span>
            <Link href="/become-a-tutor" className="font-semibold text-amber-700 hover:underline">
              Apply to become a tutor
            </Link>
          </div>
        </div>
      ) : (
        /* Authenticated View */
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{tutorData.public_display_name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                    tutorData.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tutorData.status === 'under_review'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tutorData.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ref: <span className="font-mono font-bold text-slate-700">{tutorData.reference_number}</span> • Rate:{' '}
                <strong className="text-slate-800">{tutorData.hourly_rate_etb} ETB/hr</strong> • {tutorData.subjects.join(', ')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setTutorData(null);
                setReferenceNumber('');
                setPhone('');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              Log Out
            </button>
          </div>

          {/* Interactive Schedule Editor */}
          <TutorAvailabilityEditor
            initialAvailability={tutorData.weekly_availability}
            onSave={handleSaveAvailability}
            isLoading={isSaving}
          />
        </div>
      )}
    </div>
  );
}
