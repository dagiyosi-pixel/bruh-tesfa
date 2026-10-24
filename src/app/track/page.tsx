import React from 'react';
import Link from 'next/link';
import { ParentRequestTracker } from '@/components/ParentRequestTracker';
import {
  ShieldCheckIcon,
  SearchIcon,
  PhoneIcon,
  TelegramIcon,
  GraduationCapIcon,
  ArrowRightIcon,
} from '@/components/Icons';
import {
  DEFAULT_SUPPORT_PHONE,
  DEFAULT_TELEGRAM_COMMUNITY_URL,
  DEFAULT_TELEGRAM_ADMIN_USERNAME,
} from '@/lib/constants';

interface TrackPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export const metadata = {
  title: 'Track Your Request | BRUH TESFA',
  description: 'Check the real-time matching and screening status of your tutoring request in Addis Ababa.',
};

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const { ref } = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/60">
          <SearchIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>Parent & Tutor Status Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Your Tutoring Request
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Enter your reference number (e.g. <span className="font-mono text-amber-700 font-semibold">BT-REQ-2026-0001</span>) or phone number below to check real-time coordination and candidate proposals.
        </p>
      </div>

      {/* Tracker Card */}
      <div className="max-w-2xl mx-auto">
        <ParentRequestTracker initialRef={ref} />
      </div>

      {/* Quick Help for Tutors & Immediate Assistance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4 text-xs">
        {/* Tutor Portal Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <GraduationCapIcon className="w-4 h-4 text-amber-600" />
            <span>Are you a Tutor?</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Check your application review status, update your weekly availability, and view vacancy submissions in your personal portal.
          </p>
          <div className="pt-2">
            <Link
              href="/tutors/schedule"
              className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700"
            >
              <span>Open Tutor Portal</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Coordinator Help Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <PhoneIcon className="w-4 h-4 text-emerald-600" />
            <span>Need Immediate Help?</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Reach a Bruh Tesfa education coordinator directly on Telegram or call our desk lines in Addis Ababa:
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
            <a
              href="tel:0931736692"
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              0931736692
            </a>
            <a
              href="tel:0979558343"
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              0979558343
            </a>
            <a
              href={`https://t.me/${DEFAULT_TELEGRAM_ADMIN_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors"
            >
              @{DEFAULT_TELEGRAM_ADMIN_USERNAME}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
