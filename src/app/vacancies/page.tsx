import React from 'react';
import Link from 'next/link';
import { getPublicVacancies } from '@/lib/db/storage';
import VacancyCard from '@/components/VacancyCard';
import { SearchIcon, SlidersIcon, TelegramIcon, ArrowRightIcon } from '@/components/Icons';
import { SUB_CITIES_ADDIS_ABABA, SUBJECTS_TAXONOMY, GRADE_LEVELS, DEFAULT_TELEGRAM_CHANNEL_URL } from '@/lib/constants';

interface VacanciesPageProps {
  searchParams: Promise<{
    subCity?: string;
    grade?: string;
    subject?: string;
    modality?: string;
    minRate?: string;
    search?: string;
  }>;
}

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = await searchParams;
  const vacancies = await getPublicVacancies({
    subCity: params.subCity,
    grade: params.grade,
    subject: params.subject,
    modality: params.modality,
    minRate: params.minRate ? Number(params.minRate) : undefined,
    search: params.search,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/60">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Active Ethiopian Tutoring Openings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tutoring Vacancies & Job Board
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Browse real, verified private tutoring openings from families across Addis Ababa. Apply directly with your qualifications.
          </p>
        </div>

        {/* Telegram broadcast quick join */}
        <div className="shrink-0">
          <a
            href={DEFAULT_TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-xs transition-colors"
          >
            <TelegramIcon className="w-4 h-4" />
            <span>Get Telegram Vacancy Alerts</span>
          </a>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form method="GET" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div>
            <label htmlFor="search" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                name="search"
                defaultValue={params.search || ''}
                placeholder="Subject, sub-city, code..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
              />
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Sub-City Filter */}
          <div>
            <label htmlFor="subCity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sub-City (Addis Ababa)
            </label>
            <select
              id="subCity"
              name="subCity"
              defaultValue={params.subCity || ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">All Sub-Cities</option>
              {SUB_CITIES_ADDIS_ABABA.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Level Filter */}
          <div>
            <label htmlFor="grade" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Grade Level
            </label>
            <select
              id="grade"
              name="grade"
              defaultValue={params.grade || ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">All Grades</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label htmlFor="subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              defaultValue={params.subject || ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">All Subjects</option>
              {SUBJECTS_TAXONOMY.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{vacancies.length}</strong> active vacancies
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/vacancies"
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg font-medium"
            >
              Reset
            </Link>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs"
            >
              Filter Vacancies
            </button>
          </div>
        </div>
      </form>

      {/* Vacancies Grid */}
      {vacancies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            No Active Vacancies Match These Filters
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            New vacancies from families in Addis Ababa are posted daily. Join our Telegram announcement channel to receive immediate alerts when new teaching jobs open.
          </p>
          <div className="pt-2">
            <a
              href={DEFAULT_TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-xs"
            >
              <TelegramIcon className="w-4 h-4" />
              <span>Join Telegram Alerts Channel</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
