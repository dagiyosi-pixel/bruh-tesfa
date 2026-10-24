import React from 'react';
import ParentRequestForm from '@/components/ParentRequestForm';
import { ShieldCheckIcon, CheckCircleIcon, ClockIcon } from '@/components/Icons';

interface RequestTutorPageProps {
  searchParams: Promise<{
    tutorId?: string;
    tutorName?: string;
  }>;
}

export default async function RequestTutorPage({ searchParams }: RequestTutorPageProps) {
  const { tutorId, tutorName } = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      {/* Page Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Personalized Matching
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Request a Screened Private Tutor
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Tell us about your student&apos;s curriculum, subjects, and neighborhood. We will review available tutors and propose authenticated candidates directly to you.
        </p>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-xs text-slate-600">
        <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Fayda ID & Degree Verified Tutors</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
          <CheckCircleIcon className="w-4 h-4 text-amber-600 shrink-0" />
          <span>No Parent Registration Fee</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
          <ClockIcon className="w-4 h-4 text-sky-600 shrink-0" />
          <span>14-Day Free Replacement Guarantee</span>
        </div>
      </div>

      {/* Form Component */}
      <ParentRequestForm initialTutorId={tutorId} initialTutorName={tutorName} />
    </div>
  );
}
