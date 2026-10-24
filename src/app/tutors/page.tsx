import React from 'react';
import { getPublicTutors } from '@/lib/db/storage';
import TutorCard from '@/components/TutorCard';
import { SearchIcon, SlidersIcon, ArrowRightIcon } from '@/components/Icons';
import {
  SUBJECTS_TAXONOMY,
  GRADE_LEVELS,
  SUB_CITIES_ADDIS_ABABA,
  ADDIS_ABABA_SUB_CITIES_DIRECTORY,
} from '@/lib/constants';
import { POPULAR_SEFER_CHIPS } from '@/lib/sefers';
import Link from 'next/link';

interface TutorsPageProps {
  searchParams: Promise<{
    subject?: string;
    grade?: string;
    modality?: string;
    subCity?: string;
    search?: string;
  }>;
}

export default async function TutorsPage({ searchParams }: TutorsPageProps) {
  const params = await searchParams;
  const tutors = await getPublicTutors({
    subject: params.subject,
    grade: params.grade,
    modality: params.modality,
    subCity: params.subCity,
    search: params.search,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Page Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Vetted Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
          Find a Verified Private Tutor in Addis Ababa
        </h1>
        <p className="text-slate-600 mt-2 text-base leading-relaxed">
          Every tutor listed here has undergone credential verification, identity verification, and pedagogical screening by Bruh Tesfa.
        </p>
      </div>

      {/* Search & Filter Form (Server-Driven & Bookmarkable) */}
      <form method="GET" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search query input */}
          <div className="lg:col-span-1">
            <label htmlFor="search" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                name="search"
                defaultValue={params.search || ''}
                placeholder="Subject, tutor name, or Sefer (e.g. Mexico, 4 Kilo, CMC)..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Subject filter */}
          <div>
            <label htmlFor="subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              defaultValue={params.subject || ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">All Subjects</option>
              {SUBJECTS_TAXONOMY.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Grade level filter */}
          <div>
            <label htmlFor="grade" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Grade Level
            </label>
            <select
              id="grade"
              name="grade"
              defaultValue={params.grade || ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">All Grades</option>
              {GRADE_LEVELS.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-city filter */}
          <div>
            <label htmlFor="subCity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sub-City
            </label>
            <select
              id="subCity"
              name="subCity"
              defaultValue={params.subCity || ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">All Sub-Cities</option>
              {SUB_CITIES_ADDIS_ABABA.map((sc) => (
                <option key={sc} value={sc}>
                  {sc} ({ADDIS_ABABA_SUB_CITIES_DIRECTORY[sc]?.amharic || ''})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Sefer Filter Chips */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-500 font-semibold text-[11px] mr-1">Popular Sefers:</span>
          {POPULAR_SEFER_CHIPS.slice(0, 10).map((chip) => {
            const isActive = params.search?.toLowerCase() === chip.toLowerCase();
            return (
              <Link
                key={chip}
                href={`/tutors?search=${encodeURIComponent(chip)}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200/80'
                }`}
              >
                {chip}
              </Link>
            );
          })}
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{tutors.length}</strong> vetted {tutors.length === 1 ? 'tutor' : 'tutors'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/tutors"
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg font-medium"
            >
              Clear Filters
            </Link>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {/* Results Grid */}
      {tutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            No Tutors Match Your Specific Filters
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We actively recruit and review new educators daily across all Addis Ababa sub-cities. Submit a parent request and our team will personally match a verified tutor to your requirements.
          </p>
          <div className="pt-2">
            <Link
              href="/request-tutor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
            >
              <span>Submit a Parent Tutoring Request</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Parent Request Callout Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="font-extrabold text-xl text-slate-900">
            Need a Custom Schedule or Specific Curriculum?
          </h2>
          <p className="text-sm text-slate-600">
            Our education coordinators personally evaluate your child&apos;s learning needs and recommend the best fit.
          </p>
        </div>
        <Link
          href="/request-tutor"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all"
        >
          <span>Request a Tutor Now</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
