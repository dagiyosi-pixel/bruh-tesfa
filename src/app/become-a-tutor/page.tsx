import React from 'react';
import TutorApplicationForm from '@/components/TutorApplicationForm';
import { ShieldCheckIcon, GraduationCapIcon, CheckCircleIcon, ClockIcon } from '@/components/Icons';

export default function BecomeATutorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Header Banner */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <GraduationCapIcon className="w-4 h-4 text-amber-700" />
          <span>Tutor Recruitment Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Join Addis Ababa&apos;s Most Trusted Tutoring Network
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Teach students in your local neighborhood, set your own hourly rate, and grow your professional tutoring practice with verified families.
        </p>
      </div>

      {/* 3 Pillars for Tutors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-sm">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <ShieldCheckIcon className="w-6 h-6 text-emerald-600 mb-2" />
          <h2 className="font-bold text-slate-900 text-base">Verified Families Only</h2>
          <p className="text-slate-600 mt-1 text-xs leading-relaxed">
            Every parent request is screened before introduction. No blind house visits or safety ambiguity.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <CheckCircleIcon className="w-6 h-6 text-amber-600 mb-2" />
          <h2 className="font-bold text-slate-900 text-base">Zero Upfront Cost</h2>
          <p className="text-slate-600 mt-1 text-xs leading-relaxed">
            Free to apply and list. Bruh Tesfa only collects a one-time 60% placement fee on your first month&apos;s earnings.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <ClockIcon className="w-6 h-6 text-sky-600 mb-2" />
          <h2 className="font-bold text-slate-900 text-base">You Own Months 2+</h2>
          <p className="text-slate-600 mt-1 text-xs leading-relaxed">
            0% commission on recurring months. Continue working directly with the family with complete independence.
          </p>
        </div>
      </div>

      {/* The Application Form Component */}
      <div className="pt-2">
        <TutorApplicationForm />
      </div>

      {/* Tutor FAQ Section */}
      <div className="max-w-3xl mx-auto pt-8 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-6">
          Frequently Asked Questions by Applicants
        </h2>
        <div className="space-y-4 text-sm">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900">What documents do I need to prepare?</h3>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              You will need a clear scan or photo of your Ethiopian National ID (Fayda, Kebele, or Passport) and your official University Degree Certificate or student transcript.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900">How long does verification take?</h3>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              Our review team conducts phone/in-person verification within 24 to 48 business hours. We will contact you via Telegram or phone to verify your subject readiness.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900">How does the 60% placement fee work?</h3>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              If an agreed contract is 450 ETB/hr for 18 hours (8,100 ETB total first month), our one-time fee is 4,860 ETB (60%), and you retain 3,240 ETB. For all future months (month 2, 3, 4, etc.), you retain 100% of the payment directly from the family.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
