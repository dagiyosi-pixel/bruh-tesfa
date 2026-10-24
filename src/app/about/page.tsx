import React from 'react';
import Link from 'next/link';
import { GraduationCapIcon, ShieldCheckIcon, UsersIcon, ArrowRightIcon } from '@/components/Icons';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      <div className="space-y-4 text-center">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Our Foundation & Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          About BRUH TESFA (ብሩህ ተስፋ)
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Founded in Addis Ababa to bridge the gap between dedicated Ethiopian families seeking quality education and talented educators seeking rewarding teaching opportunities.
        </p>
      </div>

      {/* Story & Philosophy */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
          The Story Behind the Name
        </h2>
        <p>
          In Amharic, <strong>&ldquo;Bruh&rdquo; (ብሩህ)</strong> means bright, illuminated, and lucid. <strong>&ldquo;Tesfa&rdquo; (ተስፋ)</strong> means hope. Together, BRUH TESFA represents our conviction that every Ethiopian student, when paired with the right mentor, possesses boundless potential to master difficult concepts, excel in national ministry exams, and unlock a brighter academic future.
        </p>
        <p>
          For years, parents across Addis Ababa have had to rely on informal, unvetted word-of-mouth or unverified street flyers when searching for home tutors. This often led to unreliable appointments, unverified credentials, and safety concerns.
        </p>
        <p>
          Bruh Tesfa transforms this experience into a dignified, secure, and professional relationship:
        </p>
        <ul className="space-y-2.5 list-disc pl-5 text-slate-800 font-medium">
          <li>We authenticate degree certificates from accredited Ethiopian universities.</li>
          <li>We verify government-issued national identity cards.</li>
          <li>We implement strict child safeguarding in accordance with Ethiopian law (Proclamation No. 1321/2024).</li>
          <li>We maintain absolute pricing transparency: 0 ETB upfront for parents, and an honest one-time 60% placement commission for tutors.</li>
        </ul>
      </div>

      {/* 3 Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <GraduationCapIcon className="w-6 h-6 text-amber-600 mb-2" />
          <h3 className="font-bold text-slate-900 text-base">Academic Integrity</h3>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            We prioritize deep conceptual understanding and active study habits (SQ3R) over rote memorization.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <ShieldCheckIcon className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-bold text-slate-900 text-base">Uncompromising Safety</h3>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            Child protection and parental visibility are non-negotiable standards on every single home placement.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <UsersIcon className="w-6 h-6 text-sky-600 mb-2" />
          <h3 className="font-bold text-slate-900 text-base">Tutor Dignity</h3>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            Educators are our partners. We treat them with utmost respect, transparent contracts, and prompt settlements.
          </p>
        </div>
      </div>

      {/* Dual Bottom CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/request-tutor"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
        >
          <span>Find a Tutor for Your Child</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
        <Link
          href="/become-a-tutor"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200"
        >
          <span>Apply as an Educator</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
