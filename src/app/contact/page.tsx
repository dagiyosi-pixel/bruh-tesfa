import React from 'react';
import {
  DEFAULT_SUPPORT_PHONE,
  DEFAULT_SUPPORT_EMAIL,
  DEFAULT_OFFICE_LOCATION,
  DEFAULT_TELEGRAM_COMMUNITY_URL,
  DEFAULT_TELEGRAM_CHANNEL_URL,
} from '@/lib/constants';
import { PhoneIcon, MailIcon, MapPinIcon, TelegramIcon } from '@/components/Icons';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Contact Bruh Tesfa
        </h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto">
          Our education coordinators in Addis Ababa are available to assist with matching inquiries, tutor applications, or safeguarding questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct Contacts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Service Desk & Support
          </h2>

          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <PhoneIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Telephone / SMS Coordination</strong>
                <a href={`tel:${DEFAULT_SUPPORT_PHONE}`} className="text-amber-700 font-semibold hover:underline">
                  {DEFAULT_SUPPORT_PHONE}
                </a>
                <span className="block text-xs text-slate-500 mt-0.5">Monday – Saturday: 8:30 AM – 7:00 PM</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MailIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Email Inquiries</strong>
                <a href={`mailto:${DEFAULT_SUPPORT_EMAIL}`} className="text-amber-700 font-semibold hover:underline">
                  {DEFAULT_SUPPORT_EMAIL}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Office Location</strong>
                <span>{DEFAULT_OFFICE_LOCATION}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Channels */}
        <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TelegramIcon className="w-6 h-6 text-sky-400" />
              <h2 className="text-lg font-bold text-white">Official Telegram Channels</h2>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              Telegram is our primary channel for instant updates, tutor recruitment postings, and exam preparation materials.
            </p>

            <div className="space-y-2.5 pt-2">
              <a
                href={DEFAULT_TELEGRAM_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
              >
                &rarr; Community Discussion Group
              </a>
              <a
                href={DEFAULT_TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
              >
                &rarr; Broadcast Announcements & Vacancies
              </a>
            </div>
          </div>

          <p className="text-[11px] text-sky-200">
            For urgent safety or misconduct reports, please use our dedicated Safeguarding form on the Safety page.
          </p>
        </div>
      </div>
    </div>
  );
}
