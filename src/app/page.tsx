import React from 'react';
import Link from 'next/link';
import { getPublicTutors } from '@/lib/db/storage';
import TutorCard from '@/components/TutorCard';
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
  POPULAR_NEIGHBORHOODS,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tutors = await getPublicTutors();

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-slate-50 to-[#FDFBF7] pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span>Addis Ababa Vetted Tutor Network</span>
                <span className="text-amber-700 font-bold">ብሩህ ተስፋ</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Exceptional Private Tutors for Your Child&apos;s{' '}
                <span className="text-amber-600 underline decoration-amber-400 decoration-wavy decoration-2">
                  Brightest Future
                </span>
                .
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                BRUH TESFA connects Ethiopian parents with personally screened, high-caliber tutors from AAU, ASTU, and top institutions. We verify credentials, match learning needs, and safeguard every home placement.
              </p>

              {/* Dual Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/request-tutor"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-md shadow-amber-600/25 transition-all min-h-[48px]"
                >
                  <span>Find a Tutor for Your Child</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>

                <Link
                  href="/become-a-tutor"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all min-h-[48px]"
                >
                  <GraduationCapIcon className="w-5 h-5 text-amber-600" />
                  <span>Become a Tutor</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/70">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">In-Person ID & Degree Verified</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/70">
                  <CheckCircleIcon className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium">Zero Upfront Cost to Parents</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/70">
                  <ClockIcon className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-medium">14-Day Placement Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 relative">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                      Verified Matching
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                      Curriculum Specialization
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Placements
                  </span>
                </div>

                <div className="space-y-4 my-5 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                    <BookOpenIcon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900">National Curriculum & EUEE Prep</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Focused Grade 8 Ministry exam and Grade 12 university entrance examination mentoring with SQ3R methodology.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <GraduationCapIcon className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900">Cambridge IGCSE & IB Diploma</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        International school curriculum support with past-paper mark schemes and analytical problem sets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900">Safeguarding & Parent Supervision</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Compliant with Ethiopian Proclamation No. 1321/2024. All lessons arranged with parental visibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/tutors"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <span>Browse Approved Tutors Directory</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            The Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            How Bruh Tesfa Works for Families
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            No endless unverified phone calls. We personally review every tutor&apos;s university credentials and background before introducing them to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
            <span className="text-3xl font-black text-amber-500/30">01</span>
            <h3 className="font-bold text-lg text-slate-900 mt-2">Submit Your Request</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Tell us your child&apos;s grade, subjects, Addis Ababa sub-city, and learning goals. No account required.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
            <span className="text-3xl font-black text-amber-500/30">02</span>
            <h3 className="font-bold text-lg text-slate-900 mt-2">Candidate Screening</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              We check degree certificates, National IDs (Fayda/Kebele), and subject competence across our tutor database.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
            <span className="text-3xl font-black text-amber-500/30">03</span>
            <h3 className="font-bold text-lg text-slate-900 mt-2">Personal Match Intro</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              We propose shortlisted tutors compatible with your schedule and budget. You review their profile and approve.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
            <span className="text-3xl font-black text-amber-500/30">04</span>
            <h3 className="font-bold text-lg text-slate-900 mt-2">Placement & Guarantee</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              First lesson begins under parental supervision. Protected by our 14-day replacement safeguard policy.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED APPROVED TUTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Verified Profiles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Approved Private Tutors
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Real educators authenticated by Bruh Tesfa. No fictional or unverified profiles.
            </p>
          </div>
          <Link
            href="/tutors"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-800"
          >
            <span>View All Profiles</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.slice(0, 3).map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      </section>

      {/* COVERAGE AREAS ACROSS ADDIS ABABA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Local Service Areas
            </span>
            <h2 className="text-3xl font-extrabold mt-2">
              Serving All 11 Addis Ababa Sub-Cities
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Our vetted tutors travel directly to your home or offer secure online sessions throughout the capital.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SUB_CITIES_ADDIS_ABABA.map((subCity) => (
              <Link
                key={subCity}
                href={`/tutors?subCity=${encodeURIComponent(subCity)}`}
                className="bg-slate-800/80 hover:bg-amber-600/20 border border-slate-700 hover:border-amber-500/50 p-3 rounded-xl text-center transition-all group"
              >
                <MapPinIcon className="w-4 h-4 text-amber-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-slate-200 group-hover:text-amber-300">
                  {subCity}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Popular residential hubs covered:{' '}
              <span className="text-slate-300">
                {POPULAR_NEIGHBORHOODS.slice(0, 8).join(' • ')}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* TELEGRAM & RECRUITMENT CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <TelegramIcon className="w-3.5 h-3.5" />
              <span>Official Ethiopian Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Join the Bruh Tesfa Telegram Channel
            </h2>
            <p className="text-sm text-sky-100 leading-relaxed">
              Receive notifications of verified tutor openings, study guides for the Grade 8 and EUEE national exams, and parent community discussions.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={DEFAULT_TELEGRAM_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-md"
              >
                <TelegramIcon className="w-4 h-4" />
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
