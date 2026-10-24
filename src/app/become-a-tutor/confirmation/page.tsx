import React from 'react';
import Link from 'next/link';
import { CheckCircleIcon, TelegramIcon, ArrowRightIcon } from '@/components/Icons';
import { DEFAULT_TELEGRAM_COMMUNITY_URL } from '@/lib/constants';

interface ConfirmationPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function TutorConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { ref } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircleIcon className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Application Received
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Your Application is Under Review
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Thank you for applying to become a Bruh Tesfa tutor. Your credentials and profile have been securely recorded in our administrative system.
        </p>
      </div>

      {ref && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-xs">
          <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider block">
            Application Reference Number
          </span>
          <span className="text-lg font-mono font-extrabold text-slate-900">
            {ref}
          </span>
        </div>
      )}

      {/* Realistic Expectations Box */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left text-xs sm:text-sm text-slate-700 space-y-2.5">
        <h2 className="font-bold text-slate-900 text-sm">What Happens Next:</h2>
        <ul className="space-y-2 list-disc pl-4 text-slate-600">
          <li>
            <strong>Pedagogical & Credential Review:</strong> Our coordinator will inspect your university degree and national identification within 24–48 hours.
          </li>
          <li>
            <strong>Introductory Phone Interview:</strong> We will contact you via Telegram or phone to discuss your teaching approach and schedule.
          </li>
          <li>
            <strong>Profile Approval:</strong> Once approved, your sanitized profile will be published to the public directory and proposed to matching parent requests.
          </li>
        </ul>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={DEFAULT_TELEGRAM_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all"
        >
          <TelegramIcon className="w-4 h-4" />
          <span>Join Tutor Telegram Community</span>
        </a>

        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all"
        >
          <span>Return to Homepage</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
