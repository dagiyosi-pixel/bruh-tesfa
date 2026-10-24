import React from 'react';
import Link from 'next/link';
import { getPublicTutors, getPublicVacancies } from '@/lib/db/storage';
import TutorCard from '@/components/TutorCard';
import VacancyCard from '@/components/VacancyCard';
import HomeQuickFinder from '@/components/HomeQuickFinder';
import {
  ShieldCheckIcon,
  GraduationCapIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  TelegramIcon,
  MapPinIcon,
} from '@/components/Icons';
import {
  DEFAULT_TELEGRAM_COMMUNITY_URL,
  SUB_CITIES_ADDIS_ABABA,
  SubCityName,
  ADDIS_ABABA_SUB_CITIES_DIRECTORY,
  POPULAR_NEIGHBORHOODS,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [tutors, vacancies] = await Promise.all([
    getPublicTutors(),
    getPublicVacancies(),
  ]);

  return (
    <div className="space-y-12 lg:space-y-16 pb-14">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-slate-50 to-[#FDFBF7] pt-8 pb-12 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-16 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span>Addis Ababa Vetted Tutor Network</span>
                <span className="text-amber-700 font-bold">ብሩህ ተስፋ</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Exceptional Private Tutors for Your Child&apos;s{' '}
                <span className="text-amber-600 underline decoration-amber-400 decoration-wavy decoration-2">
                  Brightest Future
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                BRUH TESFA connects Ethiopian parents with personally screened, high-caliber tutors from AAU, ASTU, and top institutions. We verify credentials, match learning needs, and safeguard every home placement.
              </p>

              {/* Dual Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  href="/request-tutor"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-md shadow-amber-600/20 transition-all min-h-[44px]"
                >
                  <span>Find a Tutor for Your Child</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>

                <Link
                  href="/become-a-tutor"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all min-h-[44px]"
                >
                  <GraduationCapIcon className="w-4 h-4 text-amber-600" />
                  <span>Become a Tutor</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/80 backdrop-blur-xs p-2 rounded-xl border border-slate-200/70">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">In-Person ID & Degree Verified</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/80 backdrop-blur-xs p-2 rounded-xl border border-slate-200/70">
                  <CheckCircleIcon className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium">Zero Upfront Cost to Parents</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/80 backdrop-blur-xs p-2 rounded-xl border border-slate-200/70">
                  <ClockIcon className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-medium">14-Day Placement Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Quick Match Finder */}
            <div className="lg:col-span-5">
              <HomeQuickFinder />
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
            The Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How Bruh Tesfa Works for Families
          </h2>
          <p className="text-slate-600 mt-2 text-xs sm:text-sm">
            No endless unverified phone calls. We personally review every tutor&apos;s university credentials and background before introducing them to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs relative">
            <span className="text-2xl font-black text-amber-500/30">01</span>
            <h3 className="font-bold text-base text-slate-900 mt-1.5">Submit Your Request</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Tell us your child&apos;s grade, subjects, Addis Ababa sub-city, and learning goals. No account required.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs relative">
            <span className="text-2xl font-black text-amber-500/30">02</span>
            <h3 className="font-bold text-base text-slate-900 mt-1.5">Candidate Screening</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We check degree certificates, National IDs (Fayda/Kebele), and subject competence across our tutor database.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs relative">
            <span className="text-2xl font-black text-amber-500/30">03</span>
            <h3 className="font-bold text-base text-slate-900 mt-1.5">Personal Match Intro</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We propose shortlisted tutors compatible with your schedule and budget. You review their profile and approve.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs relative">
            <span className="text-2xl font-black text-amber-500/30">04</span>
            <h3 className="font-bold text-base text-slate-900 mt-1.5">Placement & Guarantee</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              First lesson begins under parental supervision. Protected by our 14-day replacement safeguard policy.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED APPROVED TUTORS OR ACTIVE REAL VACANCIES */}
      {tutors.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
                Verified Profiles
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Approved Private Tutors
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Real educators authenticated by Bruh Tesfa. No fictional or unverified profiles.
              </p>
            </div>
            <Link
              href="/tutors"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              <span>View All Profiles</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tutors.slice(0, 3).map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
                Current Openings & Placements
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Active Tutoring Opportunities in Addis Ababa
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Verified tutoring requests from families. We strictly never publish fictional tutor profiles.
              </p>
            </div>
            <Link
              href="/vacancies"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              <span>View All Vacancies</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vacancies.slice(0, 3).map((vac) => (
              <VacancyCard key={vac.id} vacancy={vac} />
            ))}
          </div>
        </section>
      )}

      {/* COVERAGE AREAS ACROSS ADDIS ABABA */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
              Local Service Areas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Serving All 11 Addis Ababa Sub-Cities
            </h2>
            <p className="text-slate-400 mt-1.5 text-xs sm:text-sm">
              Our vetted tutors travel directly to your home or offer secure online sessions throughout the capital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SUB_CITIES_ADDIS_ABABA.map((subCity) => {
              const entry = ADDIS_ABABA_SUB_CITIES_DIRECTORY[subCity as SubCityName];
              return (
                <Link
                  key={subCity}
                  href={`/tutors?subCity=${encodeURIComponent(subCity)}`}
                  className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 p-3.5 rounded-xl transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MapPinIcon className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300">
                          {subCity}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        {entry?.amharic}
                      </span>
                    </div>
                    {entry && (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {entry.neighborhoods.slice(0, 4).join(' • ')}
                      </p>
                    )}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="line-clamp-1">{entry?.prominentLandmarks[0] || 'Vetted Tutors Available'}</span>
                    <ArrowRightIcon className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Popular residential hubs covered:{' '}
              <span className="text-slate-300">
                {POPULAR_NEIGHBORHOODS.slice(0, 16).join(' • ')}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* TELEGRAM & RECRUITMENT CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <TelegramIcon className="w-3 h-3" />
              <span>Official Ethiopian Community</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Join the Bruh Tesfa Telegram Channel
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              Receive notifications of verified tutor openings, study guides for the Grade 8 and EUEE national exams, and parent community discussions.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href={DEFAULT_TELEGRAM_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-xs"
              >
                <TelegramIcon className="w-3.5 h-3.5" />
                <span>Join Telegram Channel</span>
              </a>
              <Link
                href="/become-a-tutor"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <span>Apply as a Tutor</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
