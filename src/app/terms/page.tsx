import React from 'react';
import { AlertTriangleIcon } from '@/components/Icons';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-2xl flex items-start gap-3">
        <AlertTriangleIcon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Draft Terms for Owner Review:</strong> These Terms of Service represent initial operational rules for Bruh Tesfa. They must be submitted to qualified Ethiopian legal counsel to confirm alignment with Ethiopian contract law, consumer protection regulations, and civil code provisions.
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Legal Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Terms of Service
        </h1>
        <p className="text-slate-600 text-sm">
          Last Updated: February 2026 • Bruh Tesfa Addis Ababa
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Nature of the Service</h2>
          <p>
            BRUH TESFA operates an intermediary matching and introduction platform connecting independent tutors with parents or guardians seeking private educational instruction. Bruh Tesfa is not an employer, school, or principal educational institution. Tutors operate as independent service providers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Verification Standards & Disclaimers</h2>
          <p>
            Bruh Tesfa reviews identity documents (Fayda / Kebele / Passport) and higher educational credentials (degrees / diplomas) of applicants. However:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We do not guarantee specific academic test scores, national exam outcomes (EUEE, Grade 8), or school admission results.</li>
            <li>Verification indicates that an applicant presented authentic documents; it does not replace ongoing parental supervision during home lessons.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Parental Responsibilities</h2>
          <p>
            Parents or guardians agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Ensure an adult guardian is present in the residence or within clear visibility during all in-person lessons involving minors.</li>
            <li>Maintain a respectful and safe domestic environment for the tutor.</li>
            <li>Compensate agreed lesson packages promptly as scheduled.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. 14-Day Replacement Policy</h2>
          <p>
            If a parent or tutor determines within the first two (2) lessons or fourteen (14) calendar days that the educational match is unsuitable, Bruh Tesfa will propose alternative candidate tutors without additional placement charges.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. Limitation of Liability & Dispute Resolution</h2>
          <p>
            To the maximum extent permitted under Ethiopian law, Bruh Tesfa&apos;s cumulative liability arising out of any placement shall not exceed the placement commission amount received for that placement. Any disputes shall first be submitted to good-faith mediation through Bruh Tesfa management in Addis Ababa.
          </p>
        </section>
      </div>
    </div>
  );
}
