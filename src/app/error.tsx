'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for Vercel log tracking
    console.error('BRUH TESFA Application Error:', error);
  }, [error]);

  const isConfigError =
    error?.name === 'ProductionStorageConfigurationError' ||
    error?.message?.includes('NEXT_PUBLIC_SUPABASE_URL') ||
    error?.message?.includes('Database configuration error');

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-3xl font-bold shadow-inner">
          {isConfigError ? '⚙️' : '⚠️'}
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span>BRUH TESFA • ብሩህ ተስፋ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isConfigError ? 'Database Setup Required' : 'Temporary Service Notice'}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isConfigError
              ? 'This deployment is running in production mode, but Supabase credentials have not yet been configured in Vercel project environment variables.'
              : 'Our tutors and matching system encountered an unexpected condition. Please try reloading or reach out directly to our coordinators.'}
          </p>
        </div>

        {isConfigError && (
          <div className="text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900 font-sans">Required Vercel Environment Variables:</p>
            <p className="text-amber-700">• NEXT_PUBLIC_SUPABASE_URL</p>
            <p className="text-amber-700">• SUPABASE_SERVICE_ROLE_KEY</p>
            <p className="text-slate-500 font-sans mt-2 pt-2 border-t border-slate-200">
              Or set <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">PERSISTENCE_MODE=local</code> for instant zero-config demo mode.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm"
          >
            Try Again / ደግመው ይሞክሩ
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Home / መነሻ ገጽ
          </Link>
        </div>
      </div>
    </div>
  );
}
