import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicTutorBySlug } from '@/lib/db/storage';
import {
  ShieldCheckIcon,
  GraduationCapIcon,
  MapPinIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowRightIcon,
  TelegramIcon,
  CheckCircleIcon,
} from '@/components/Icons';

interface TutorProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function TutorProfilePage({ params }: TutorProfilePageProps) {
  const { slug } = await params;
  const tutor = await getPublicTutorBySlug(slug);

  if (!tutor) {
    notFound();
  }

  const shareUrl = `https://bruhtesfa.et/tutors/${tutor.slug}`;
  const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out ${tutor.display_name} - Verified Tutor on Bruh Tesfa Addis Ababa`)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Breadcrumb & Back link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">Home</Link>
          <span>/</span>
          <Link href="/tutors" className="hover:text-slate-800">Tutors</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{tutor.display_name}</span>
        </nav>

        <Link
          href="/tutors"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
        >
          <span>&larr; Back to all tutors</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {tutor.display_name}
              </h1>
              {tutor.is_verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Verified by Bruh Tesfa</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <GraduationCapIcon className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{tutor.education_summary}</span>
            </div>
          </div>

          {/* Pricing & CTA Card */}
          <div className="w-full md:w-auto bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-center md:text-right shrink-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {Number(tutor.hourly_rate_etb).toLocaleString()}{' '}
              <span className="text-xs font-bold text-slate-600 uppercase">ETB / hr</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Indicative hourly teaching rate</p>
            <div className="mt-3">
              <Link
                href={`/request-tutor?tutorId=${tutor.id}&tutorName=${encodeURIComponent(tutor.display_name)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all"
              >
                <span>Request {tutor.display_name}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Teaching Modality
            </span>
            <span className="font-bold text-slate-800">
              {tutor.teaching_modes.map((m) => m === 'in_person' ? 'In-Person Home Tutoring' : m === 'online' ? 'Online Tutoring' : 'Hybrid').join(', ')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Service Areas (Addis Ababa)
            </span>
            <span className="font-bold text-slate-800">
              {tutor.service_areas.join(', ')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Instruction Languages
            </span>
            <span className="font-bold text-slate-800">
              {tutor.languages.join(' • ')}
            </span>
          </div>
        </div>

        {/* Biography & Approach */}
        <div className="space-y-4 pt-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Teaching Methodology & Approach
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {tutor.teaching_approach}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Educator Background
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {tutor.bio}
            </p>
          </div>
        </div>

        {/* Subjects & Grade Levels */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Teaching Subjects
            </h2>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Target Grade Levels & Curricula
            </h2>
            <div className="flex flex-wrap gap-2">
              {tutor.grade_levels.map((gl) => (
                <span
                  key={gl}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {gl}
                </span>
              ))}
              {tutor.curricula.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Safeguarding & Verification Notice */}
        <div className="pt-4 border-t border-slate-100 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <strong>Bruh Tesfa Safeguarding Commitment:</strong> This educator has presented valid university degree credentials and government-issued national identification. Private contact details are securely managed by Bruh Tesfa coordinators to prevent spam and safeguard families. All in-person home tutoring must take place with parent or guardian oversight in accordance with Ethiopian Proclamation No. 1321/2024.
          </div>
        </div>

        {/* Share actions */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Share this profile:</span>
            <a
              href={telegramShare}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-semibold"
            >
              <TelegramIcon className="w-3.5 h-3.5" />
              <span>Share on Telegram</span>
            </a>
          </div>
          <div>
            <span>Profile ID: {tutor.slug}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
