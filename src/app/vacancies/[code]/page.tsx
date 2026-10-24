import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicVacancyByCode } from '@/lib/db/storage';
import VacancyApplicationForm from '@/components/VacancyApplicationForm';
import {
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  GraduationCapIcon,
  BookOpenIcon,
  TelegramIcon,
  ArrowRightIcon,
} from '@/components/Icons';

interface VacancyPageProps {
  params: Promise<{ code: string }>;
}

export default async function SingleVacancyPage({ params }: VacancyPageProps) {
  const { code } = await params;
  const vacancy = await getPublicVacancyByCode(code, true);

  if (!vacancy || vacancy.status === 'draft' || vacancy.status === 'archived') {
    notFound();
  }

  const shareUrl = `https://bruhtesfa.et/vacancies/${vacancy.vacancy_code}`;
  const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`[Bruh Tesfa Vacancy] ${vacancy.title} (${vacancy.sub_city}) - ${vacancy.hourly_rate_etb} ETB/hr`)}`;
  const monthlyEst = Math.round(vacancy.hourly_rate_etb * (vacancy.hours_per_session || 1.5) * 3 * 4);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/vacancies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>&larr; Back to all vacancies</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Job Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Header info */}
            <div className="border-b border-slate-100 pb-5 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  {vacancy.vacancy_code}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {vacancy.status.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {vacancy.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {vacancy.sub_city} {vacancy.general_area ? `(${vacancy.general_area})` : ''}, Addis Ababa
                </span>
              </div>
            </div>

            {/* Compensation Box */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Agreed Compensation Rate
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {Number(vacancy.hourly_rate_etb).toLocaleString()}{' '}
                  <span className="text-xs font-bold text-slate-600 uppercase">ETB / hour</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-amber-900 block">Est. Monthly Total</span>
                <span className="text-base font-extrabold text-amber-950 font-mono">
                  ~{monthlyEst.toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Academic & Schedule Specifications */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">Grade Level</span>
                  <span className="font-bold text-slate-900 block">{vacancy.grade_level}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">Curriculum</span>
                  <span className="font-bold text-slate-900 block">{vacancy.curriculum}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">Required Subjects</span>
                <div className="flex flex-wrap gap-1.5">
                  {vacancy.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase">Schedule & Timing</span>
                <p className="font-semibold text-slate-800">
                  {vacancy.lesson_frequency} • {vacancy.time_window || 'Afternoon hours'}
                </p>
                {vacancy.schedule_days.length > 0 && (
                  <p className="text-xs text-slate-600">Preferred Days: {vacancy.schedule_days.join(', ')}</p>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Required Qualifications</span>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  {vacancy.required_qualifications}
                </p>
              </div>

              {vacancy.parent_preferences && (
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 uppercase">Family Focus & Student Needs</span>
                  <p className="text-amber-950 text-xs sm:text-sm leading-relaxed">
                    {vacancy.parent_preferences}
                  </p>
                </div>
              )}
            </div>

            {/* Safeguarding notice */}
            <div className="pt-2 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bruh Tesfa Safeguarding:</strong> In-person sessions must occur with parent presence in the residence. Exact residential addresses are shared only with the selected, verified educator prior to the first lesson.
              </span>
            </div>

            {/* Share action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Share with fellow educators:</span>
              <a
                href={telegramShare}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-semibold"
              >
                <TelegramIcon className="w-4 h-4" />
                <span>Share on Telegram</span>
              </a>
            </div>

          </div>
        </div>

        {/* Right Column: Application Form */}
        <div className="lg:col-span-5">
          <VacancyApplicationForm vacancy={vacancy} />
        </div>

      </div>
    </div>
  );
}
