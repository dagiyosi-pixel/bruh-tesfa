import React from 'react';
import Link from 'next/link';
import { CheckCircleIcon, TelegramIcon, PhoneIcon } from '@/components/Icons';
import { DEFAULT_TELEGRAM_COMMUNITY_URL, DEFAULT_SUPPORT_PHONE } from '@/lib/constants';
import { ParentRequestTracker } from '@/components/ParentRequestTracker';

interface ConfirmationPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function RequestConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { ref } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 text-center space-y-6">
      <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircleIcon className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
          Request Logged
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Request Has Been Received
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
          Our education coordinator in Addis Ababa is reviewing your requirements and matching qualified tutors based on subject, grade, and location.
        </p>
      </div>

      {/* Live Status Tracker */}
      <div className="text-left">
        <ParentRequestTracker initialRef={ref} />
      </div>

      {/* Process Clarification */}
      <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 text-left text-xs text-slate-700 space-y-2.5">
        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Next Coordination Steps</h2>
        <ul className="space-y-1.5 list-disc pl-4 text-slate-600 leading-normal">
          <li>
            <strong>Coordinator Follow-Up:</strong> A Bruh Tesfa coordinator will contact your preferred number within 24 business hours to confirm schedule compatibility.
          </li>
          <li>
            <strong>Candidate Verification:</strong> We match tutors with verified educational backgrounds in your specific sub-city.
          </li>
          <li>
            <strong>First Introductory Lesson:</strong> Once you review and approve a candidate, an introductory lesson is scheduled.
          </li>
        </ul>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <a
          href={`tel:${DEFAULT_SUPPORT_PHONE}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
        >
          <PhoneIcon className="w-4 h-4" />
          <span>Call Coordinator: {DEFAULT_SUPPORT_PHONE}</span>
        </a>

        <a
          href={DEFAULT_TELEGRAM_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
        >
          <TelegramIcon className="w-4 h-4" />
          <span>Telegram Community</span>
        </a>
      </div>

      <div className="pt-1">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
          &larr; Return to Homepage
        </Link>
      </div>
    </div>
  );
}
