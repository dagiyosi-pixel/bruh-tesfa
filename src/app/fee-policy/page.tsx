import React from 'react';
import { CheckCircleIcon, ClockIcon, AlertTriangleIcon } from '@/components/Icons';

export default function FeePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Transparent Financial Model
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Placement Fee Policy & Economics
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Clear, predictable terms. Zero hidden registration fees, zero subscription lock-ins, and full transparency for educators and parents.
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-600" />
          <h2 className="text-lg font-bold text-amber-950">
            The Core Formula: 60% One-Time Placement Commission
          </h2>
        </div>
        <p className="text-sm text-amber-900 leading-relaxed">
          Bruh Tesfa operates on a <strong>single placement fee model</strong>. We invest coordinator time in screening educators, advertising to families, handling logistics, and guaranteeing replacements.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-amber-950">
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
            <strong>Parent Cost:</strong>
            <p className="mt-0.5">0 ETB registration or matching fee. Parents only pay for actual lessons taught.</p>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
            <strong>Tutor Application:</strong>
            <p className="mt-0.5">0 ETB application fee. Tutors never pay anything until they have a confirmed, paying client.</p>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
            <strong>Months 2 and Beyond:</strong>
            <p className="mt-0.5">0% ongoing commission. 100% of all subsequent earnings remain with the tutor.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 text-sm leading-relaxed">
        
        {/* Concrete Example */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">1. Concrete Calculation Example</h2>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2 text-slate-800">
            <p><strong>Agreed Rate:</strong> 400 ETB / hour</p>
            <p><strong>Agreed Frequency:</strong> 3 days per week × 1.5 hours = 4.5 hrs/week</p>
            <p><strong>First Month Total (4 weeks):</strong> 18 hours × 400 ETB = 7,200 ETB</p>
            <div className="pt-2 border-t border-slate-200 space-y-1 font-bold">
              <p className="text-amber-800">Bruh Tesfa One-Time Placement Fee (60%): 4,320 ETB</p>
              <p className="text-emerald-800">Tutor First-Month Net Earnings: 2,880 ETB</p>
              <p className="text-slate-700">Month 2+ Net Earnings to Tutor: 7,200 ETB / month (100% retained)</p>
            </div>
          </div>
        </section>

        {/* Due Date & Settlement */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. When the Placement Fee Becomes Due</h2>
          <p>
            The placement fee is due within <strong>seven (7) calendar days</strong> following the tutor&apos;s first successful introductory lesson. Payment can be reconciled via official Ethiopian banking channels:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-800">
            <li>Telebirr Merchant / Account Transfer</li>
            <li>Commercial Bank of Ethiopia (CBE Birr / Account)</li>
            <li>Awash Bank / Bank of Abyssinia mobile transfer</li>
          </ul>
        </section>

        {/* Failure & Replacement Protection */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Placement Safeguard & Failure Clause</h2>
          <p>
            What happens if the tutoring arrangement terminates early?
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Cancellation within 2 lessons:</strong> If a family or tutor concludes that the match is unsuitable within the first 2 sessions, Bruh Tesfa provides a full replacement tutor without an additional placement fee.</li>
            <li><strong>Immediate withdrawal:</strong> If the student relocates or cancels before the second lesson, the placement commission is adjusted proportionally to lessons actually taught or waived entirely.</li>
          </ul>
        </section>

        {/* Repeat Work */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Repeat Work & Siblings</h2>
          <p>
            If the same family continues with the tutor for multiple consecutive months, <strong>no additional commission is charged</strong>. If the family requests tutoring for a new sibling or a separate subject requiring a new matching process, standard placement terms apply.
          </p>
        </section>

      </div>
    </div>
  );
}
