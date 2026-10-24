'use client';

// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Persistent Tutor Portal & Schedule Hub
// Real session persistence (HttpOnly cookies), vacancy applications tracking,
// weekly availability planner, and account password security.
// =============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TutorAvailabilityEditor from '@/components/TutorAvailabilityEditor';
import { WeeklyAvailability } from '@/lib/availability';
import {
  ShieldCheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  GraduationCapIcon,
  ArrowRightIcon,
} from '@/components/Icons';

interface TutorPortalState {
  id: string;
  reference_number: string;
  public_display_name: string;
  email: string;
  phone: string;
  status: string;
  subjects: string[];
  grade_levels: string[];
  weekly_availability?: WeeklyAvailability;
  blackout_dates?: string[];
  availability_confirmed_at?: string;
  hourly_rate_etb: number;
  has_password?: boolean;
}

interface SubmittedApplication {
  id: string;
  vacancy_id: string;
  applicant_name: string;
  proposed_rate_etb?: number;
  status: string;
  created_at: string;
}

export default function TutorSchedulePortalPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'applications' | 'security'>('schedule');
  const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password');
  
  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [phone, setPhone] = useState('');
  
  // Loading & session state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [tutorData, setTutorData] = useState<TutorPortalState | null>(null);
  const [applications, setApplications] = useState<SubmittedApplication[]>([]);
  
  // Schedule saving state
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string | null>(null);
  
  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // 1. Restore persistent session on page load
  useEffect(() => {
    fetch('/api/tutors/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.tutor) {
          setTutorData(data.tutor);
          setApplications(data.applications || []);
        }
      })
      .catch(() => {})
      .finally(() => setIsInitializing(false));
  }, []);

  // 2. Handle Password-based Sign-in
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/tutors/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, secret: password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      setTutorData(data.tutor);
      
      // Fetch applications for restored session
      const sessRes = await fetch('/api/tutors/auth/session');
      const sessData = await sessRes.json();
      if (sessData.authenticated) {
        setApplications(sessData.applications || []);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 3. Handle Reference Code + Phone Lookup
  const handleCodeLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/tutors/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: referenceNumber, secret: phone, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No matching tutor application found');
      }

      setTutorData(data.tutor);
      
      const sessRes = await fetch('/api/tutors/auth/session');
      const sessData = await sessRes.json();
      if (sessData.authenticated) {
        setApplications(sessData.applications || []);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 4. Handle Sign Out
  const handleSignOut = async () => {
    await fetch('/api/tutors/auth/logout', { method: 'POST' });
    setTutorData(null);
    setApplications([]);
    setIdentifier('');
    setPassword('');
    setReferenceNumber('');
    setPhone('');
  };

  // 5. Save Weekly Schedule
  const handleSaveAvailability = async (
    availability: WeeklyAvailability,
    blackoutDates: string[]
  ) => {
    if (!tutorData) return;
    setIsSavingSchedule(true);
    setScheduleSuccessMsg(null);

    try {
      const res = await fetch('/api/tutors/portal/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: tutorData.reference_number,
          phone: tutorData.phone,
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
      setScheduleSuccessMsg('Your schedule & blackout dates were saved successfully!');
      setTimeout(() => setScheduleSuccessMsg(null), 5000);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // 6. Set / Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ text: 'Password must be at least 8 characters long.', isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'Passwords do not match.', isError: true });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/tutors/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordMessage({ text: 'Password set successfully! You can now sign in with your phone or email and this password.', isError: false });
      setNewPassword('');
      setConfirmPassword('');
      setTutorData((prev) => (prev ? { ...prev, has_password: true } : null));
    } catch (err: unknown) {
      setPasswordMessage({ text: err instanceof Error ? err.message : 'Error setting password', isError: true });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Checking your Bruh Tesfa educator session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-950 border border-amber-300">
          <ClockIcon className="w-3.5 h-3.5 text-amber-700" />
          <span>Educator Self-Service Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {tutorData ? `Welcome, ${tutorData.public_display_name}` : 'Tutor Portal & Schedule'}
        </h1>
        <p className="text-sm text-slate-600">
          {tutorData
            ? 'Manage your weekly teaching windows, track job applications, and configure account security.'
            : 'Sign in to update your availability, track vacancy applications, and manage student requests.'}
        </p>
      </div>

      {/* =========================================================================
          GUEST VIEW: AUTHENTICATION CARD
         ========================================================================= */}
      {!tutorData ? (
        <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          {/* Method Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setAuthError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                loginMethod === 'password'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In with Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('code');
                setAuthError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                loginMethod === 'code'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reference & Phone
            </button>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {loginMethod === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone, Email, or Reference Code
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. +251 91 123 4567 or BT-TUT-2026-0001"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-amber-700 hover:underline font-semibold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Stay signed in for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                {isAuthenticating ? 'Signing In...' : 'Sign In to Portal &rarr;'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeLookup} className="space-y-4">
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
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 font-mono font-medium"
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
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                {isAuthenticating ? 'Verifying...' : 'Access My Schedule &rarr;'}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            <span>New to Bruh Tesfa? </span>
            <Link href="/become-a-tutor" className="font-bold text-amber-700 hover:underline">
              Apply to become a tutor &rarr;
            </Link>
          </div>
        </div>
      ) : (
        /* =========================================================================
            AUTHENTICATED VIEW: TUTOR DASHBOARD
           ========================================================================= */
        <div className="space-y-6">
          {/* Identity & Status Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{tutorData.public_display_name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                    tutorData.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : tutorData.status === 'under_review'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tutorData.status.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {tutorData.reference_number}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Rate: <strong className="text-slate-800">{tutorData.hourly_rate_etb} ETB/hr</strong> •{' '}
                Subjects: <span className="text-slate-700 font-medium">{tutorData.subjects.join(', ')}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-bold text-slate-600 hover:text-red-700 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50 hover:bg-red-50 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`pb-3 transition-colors relative cursor-pointer ${
                activeTab === 'schedule'
                  ? 'text-amber-700 border-b-2 border-amber-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🗓 My Weekly Schedule & Hours
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className={`pb-3 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'applications'
                  ? 'text-amber-700 border-b-2 border-amber-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>💼 Vacancy Applications</span>
              {applications.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900">
                  {applications.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`pb-3 transition-colors relative cursor-pointer ${
                activeTab === 'security'
                  ? 'text-amber-700 border-b-2 border-amber-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🔒 Account Security & Password
            </button>
          </div>

          {/* TAB 1: WEEKLY SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {scheduleSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  <span>{scheduleSuccessMsg}</span>
                </div>
              )}
              <TutorAvailabilityEditor
                initialAvailability={tutorData.weekly_availability}
                onSave={handleSaveAvailability}
                isLoading={isSavingSchedule}
              />
            </div>
          )}

          {/* TAB 2: MY VACANCY APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">My Job Applications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track the real-time status of your applications to open tutoring vacancies.
                  </p>
                </div>
                <Link
                  href="/vacancies"
                  className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                >
                  <span>Browse Open Vacancies</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>

              {applications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">Vacancy Application</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                              app.status === 'placed'
                                ? 'bg-emerald-100 text-emerald-900'
                                : app.status === 'shortlisted'
                                ? 'bg-blue-100 text-blue-900'
                                : app.status === 'withdrawn'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Proposed Rate: <strong>{app.proposed_rate_etb || tutorData.hourly_rate_etb} ETB/hr</strong> • Submitted:{' '}
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        href={`/vacancies`}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
                      >
                        View Vacancy
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-500">You haven&apos;t submitted any vacancy applications yet.</p>
                  <Link
                    href="/vacancies"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs"
                  >
                    <span>Browse Open Vacancies</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {tutorData.has_password ? 'Change Your Account Password' : 'Set Account Password'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure your account so you can log in anytime using your phone or email.
                </p>
              </div>

              {passwordMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold ${
                    passwordMessage.isError
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isUpdatingPassword ? 'Saving Password...' : 'Save Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
