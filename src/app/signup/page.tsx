import React from 'react';
import Link from 'next/link';
import {
  GraduationCapIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PhoneIcon,
  TelegramIcon,
} from '@/components/Icons';
import { DEFAULT_SUPPORT_PHONE, DEFAULT_TELEGRAM_ADMIN_USERNAME } from '@/lib/constants';

export const metadata = {
  title: 'Sign Up & Register | BRUH TESFA (ብሩህ ተስፋ)',
  description: 'Create an account or register with Bruh Tesfa as a private home tutor or parent in Addis Ababa.',
};

export default function SignUpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/60">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
          <span>New Account Registration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Join BRUH TESFA
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Select your account type below to get started. Whether you are an educator looking for tutoring opportunities or a parent seeking a vetted home teacher.
        </p>
      </div>

      {/* Choice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Option 1: Tutor Registration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-6 relative group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCapIcon className="w-6 h-6 text-amber-600" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                For Teachers & University Graduates
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Sign Up as a Tutor
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Create your educator profile, submit your credentials (Kebele/Fayda ID and degree), set your hourly rate, and receive private tutoring placements in Addis Ababa.
            </p>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Keep 100% of continuing earnings from month 2</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Access exclusive high-paying home vacancies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personal scheduling portal & password access</span>
              </li>
            </ul>
          </div>

          <div>
            <Link
              href="/become-a-tutor"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-sm transition-all"
            >
              <span>Register as a Tutor</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Option 2: Parent Request / Account */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-6 relative group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpenIcon className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                For Parents & Guardians
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Find a Tutor for Your Child
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Register a tutoring request for your child. Tell us the grade, subject, and neighborhood. We personally match and verify educators with zero upfront sign-up fees.
            </p>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No registration or upfront fee to request</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>In-person ID & university verified teachers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>14-day free replacement guarantee</span>
              </li>
            </ul>
          </div>

          <div>
            <Link
              href="/request-tutor"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-slate-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all"
            >
              <span>Request a Tutor Now</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Already Have an Account Banner */}
      <div className="max-w-3xl mx-auto bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-800">
          Already have an existing tutor application or account?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <span>Sign In / Log In Here</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            href="/track"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
          >
            <span>Track Existing Request Status</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
