import React from 'react';
import { AlertTriangleIcon, ShieldCheckIcon } from '@/components/Icons';

export default function TutorAgreementPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-2xl flex items-start gap-3">
        <AlertTriangleIcon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Draft Agreement for Owner Review:</strong> All registered tutors must formally agree to these standards. This agreement must be checked by qualified Ethiopian legal counsel regarding independent contractor status and local regulatory compliance.
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Educator Standards
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Tutor Agreement & Code of Conduct
        </h1>
        <p className="text-slate-600 text-sm">
          Professional standards, safeguarding obligations, and placement responsibilities for Bruh Tesfa educators.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Professional Demeanor & Punctuality</h2>
          <p>
            Tutors represent Bruh Tesfa&apos;s standard of excellence. You agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Arrive on time for all scheduled sessions. In case of unexpected emergency, notify the parent and Bruh Tesfa coordinator at least 4 hours in advance.</li>
            <li>Maintain tidy, respectful professional attire suitable for home tutoring.</li>
            <li>Prepare lesson outlines and active problem sets prior to arriving at the session.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Strict Child Safeguarding Protocol</h2>
          <p>
            The safety and psychological well-being of the student are paramount:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Open Environment:</strong> Lessons involving minors must never occur behind locked doors. Maintain a visible study area with the parent in the residence.</li>
            <li><strong>Zero Physical Contact:</strong> Strictly no physical discipline, corporal punishment, or inappropriate physical contact of any kind.</li>
            <li><strong>Digital Boundaries:</strong> Do not contact minor students on private personal social media outside of parental-supervised educational channels.</li>
            <li><strong>Zero Harassment:</strong> Any verbal abuse, sexual innuendo, discriminatory comments, or threatening behavior results in permanent blacklisting and immediate reporting to law enforcement.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Truthfulness of Academic Qualifications</h2>
          <p>
            You certify that all credentials, university transcripts, degrees, and teaching experiences submitted to Bruh Tesfa are authentic and accurately described. Submission of falsified degrees constitutes fraud and immediate termination.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Fee Model & Commission Agreement</h2>
          <p>
            You agree to the transparent placement commission model:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>A one-time <strong>60% placement fee</strong> applies to the first agreed contract value (or first month of recurring lessons).</li>
            <li>The commission is payable within 7 calendar days of starting lessons with a placed family.</li>
            <li>Months 2 onwards carry <strong>0% commission</strong>. You keep 100% of continuing earnings.</li>
            <li>Circumventing Bruh Tesfa to avoid the first-month placement fee will lead to permanent de-listing and legal recourse.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
