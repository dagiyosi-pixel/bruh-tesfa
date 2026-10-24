import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, ShieldCheckIcon, CheckCircleIcon, ClockIcon, GraduationCapIcon } from '@/components/Icons';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Transparent Operations
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          How Bruh Tesfa Operates
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          From first request to successful home placement: a structured, safe, and accountable process designed for Ethiopian families and ambitious tutors.
        </p>
      </div>

      {/* Dual Perspective Toggle/Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* For Parents */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">For Parents & Guardians</h2>
              <p className="text-xs text-slate-500">Finding the right private tutor for your home</p>
            </div>
          </div>

          <ol className="space-y-4 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-amber-600 shrink-0">Step 1:</span>
              <div>
                <strong>Submit Your Requirements:</strong> Detail your child&apos;s grade level (1–12), subjects, curriculum, and preferred schedule across Addis Ababa.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-amber-600 shrink-0">Step 2:</span>
              <div>
                <strong>Coordinator Matching:</strong> We match your request with authenticated university graduates and certified teachers who specialize in your curriculum.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-amber-600 shrink-0">Step 3:</span>
              <div>
                <strong>Review Verified Profiles:</strong> We provide detailed educator profiles, degrees, and hourly rates before any lesson is booked.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-amber-600 shrink-0">Step 4:</span>
              <div>
                <strong>Trial Lesson & 14-Day Warranty:</strong> Begin lessons under parental presence. If the fit is not ideal in the first 2 lessons, we provide a replacement tutor at no extra charge.
              </div>
            </li>
          </ol>

          <div className="pt-2">
            <Link
              href="/request-tutor"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
            >
              <span>Submit a Parent Request</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* For Tutors */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">For Prospective Tutors</h2>
              <p className="text-xs text-slate-500">Monetizing your academic expertise with dignity</p>
            </div>
          </div>

          <ol className="space-y-4 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-emerald-600 shrink-0">Step 1:</span>
              <div>
                <strong>Apply Online (100% Free):</strong> Complete our multi-step profile indicating your degree, institution, subjects, and travel sub-cities.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-emerald-600 shrink-0">Step 2:</span>
              <div>
                <strong>Credential & ID Verification:</strong> Upload or present your National ID / Fayda card and university degree for administrative verification.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-emerald-600 shrink-0">Step 3:</span>
              <div>
                <strong>Receive Student Referrals:</strong> Our coordinators introduce you to pre-screened families matching your preferred teaching areas and hourly rate.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-emerald-600 shrink-0">Step 4:</span>
              <div>
                <strong>Transparent 60% Placement Fee:</strong> Bruh Tesfa receives a one-time 60% commission on your first month&apos;s earnings. All subsequent months belong 100% to you.
              </div>
            </li>
          </ol>

          <div className="pt-2">
            <Link
              href="/become-a-tutor"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-xs"
            >
              <span>Apply as an Educator</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

      {/* Safety & Safeguarding Highlight */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="w-7 h-7 text-emerald-400" />
          <h2 className="text-xl font-bold">Child Safeguarding Standards</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Bruh Tesfa requires all in-person tutoring sessions involving minors to take place with a parent or adult guardian present in the residence or within clear visibility. We never share children&apos;s personal profiles publicly, and all tutors agree to our strict Code of Conduct before placement.
        </p>
        <div>
          <Link
            href="/safety"
            className="text-amber-400 hover:text-amber-300 text-xs font-bold inline-flex items-center gap-1"
          >
            <span>Read our complete Safety & Safeguarding Policy</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
