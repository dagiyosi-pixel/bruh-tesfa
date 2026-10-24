import React from 'react';
import Link from 'next/link';
import { CheckCircleIcon, TelegramIcon, ArrowRightIcon, PhoneIcon } from '@/components/Icons';
import { DEFAULT_TELEGRAM_COMMUNITY_URL, DEFAULT_SUPPORT_PHONE } from '@/lib/constants';

interface ConfirmationPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function RequestConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { ref } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircleIcon className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Request Logged
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Your Request Has Been Received
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Our education coordinator in Addis Ababa is reviewing your requirements and matching them against our vetted tutor pool.
        </p>
      </div>

      {ref && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-xs">
          <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider block">
            Your Tracking Reference
          </span>
          <span className="text-lg font-mono font-extrabold text-slate-900">
            {ref}
          </span>
        </div>
      )}

      {/* Honest Process Clarification */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left text-xs sm:text-sm text-slate-700 space-y-3">
        <h2 className="font-bold text-slate-900 text-sm">Next Coordination Steps:</h2>
        <ul className="space-y-2 list-disc pl-4 text-slate-600">
          <li>
            <strong>Coordinator Follow-Up:</strong> A Bruh Tesfa coordinator will call or message your preferred contact number within 24 business hours to confirm student details and schedule compatibility.
          </li>
          <li>
            <strong>Candidate Profiles:</strong> We will provide verified tutor profiles and credentials for your review.
          </li>
          <li>
            <strong>First Introductory Lesson:</strong> Once you approve a candidate, an introductory lesson is scheduled. You only pay for lessons after you agree.
          </li>
        </ul>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={`tel:${DEFAULT_SUPPORT_PHONE}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
        >
          <PhoneIcon className="w-4 h-4" />
          <span>Call Coordinator: {DEFAULT_SUPPORT_PHONE}</span>
        </a>

        <a
          href={DEFAULT_TELEGRAM_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all"
        >
          <TelegramIcon className="w-4 h-4" />
          <span>Telegram Community</span>
        </a>
      </div>

      <div className="pt-2">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-800">
          &larr; Return to Homepage
        </Link>
      </div>
    </div>
  );
}
