'use client';

import React from 'react';
import Link from 'next/link';
import {
  DEFAULT_TELEGRAM_COMMUNITY_URL,
  DEFAULT_SUPPORT_PHONE,
  SECONDARY_SUPPORT_PHONE,
  DEFAULT_SUPPORT_EMAIL,
  DEFAULT_OFFICE_LOCATION,
} from '@/lib/constants';
import { TelegramIcon, PhoneIcon, MailIcon, MapPinIcon, GraduationCapIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <GraduationCapIcon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">BRUH TESFA</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  ብሩህ ተስፋ
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Connecting Ethiopian families with vetted, trustworthy, and competent private tutors across Addis Ababa. Built on integrity, child safeguarding, and transparent placement standards.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-sm text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPinIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{DEFAULT_OFFICE_LOCATION}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{DEFAULT_SUPPORT_PHONE} | {SECONDARY_SUPPORT_PHONE}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MailIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{DEFAULT_SUPPORT_EMAIL}</span>
              </div>
            </div>
          </div>

          {/* Core Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/tutors" className="hover:text-amber-400 transition-colors">
                  Find a Tutor
                </Link>
              </li>
              <li>
                <Link href="/request-tutor" className="hover:text-amber-400 transition-colors">
                  Request a Tutor
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-amber-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/become-a-tutor" className="hover:text-amber-400 transition-colors">
                  Become a Tutor
                </Link>
              </li>
              <li>
                <Link href="/vacancies" className="hover:text-amber-400 transition-colors font-medium text-amber-300">
                  Tutoring Vacancies Board
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-amber-400 transition-colors">
                  Safety & Safeguarding
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About Bruh Tesfa
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Suite */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Governance & Policies
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Notice (Proc. 1321/2024)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/tutor-agreement" className="hover:text-amber-400 transition-colors">
                  Tutor Code of Conduct
                </Link>
              </li>
              <li>
                <Link href="/fee-policy" className="hover:text-amber-400 transition-colors">
                  Placement Fee Policy (60%)
                </Link>
              </li>
              <li>
                <Link href="/safety#report" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Report a Concern / Incident
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Operator */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Community & Operations
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Join our Telegram channel for verified tutor announcements, exam study guides, and recruitment calls.
            </p>
            <a
              href={DEFAULT_TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-all mb-4"
            >
              <TelegramIcon className="w-4 h-4" />
              <span>Join Telegram Community</span>
            </a>
          </div>
        </div>

        {/* Bottom Disclaimers & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            &copy; {new Date().getFullYear()} BRUH TESFA (ብሩህ ተስፋ). All rights reserved. Addis Ababa, Ethiopia
            <Link
              href="/admin/login"
              className="text-slate-500 hover:text-amber-500 transition-colors select-none font-bold"
              aria-label="Staff Portal Doorway"
              title=""
            >
              .
            </Link>
          </p>
          <p className="text-[11px] text-slate-500 text-center md:text-right max-w-xl">
            Important Notice: Bruh Tesfa facilitates matches between independent tutors and families. We conduct identity and credential verification, but we do not guarantee exam score outcomes. Terms and policies are subject to formal Ethiopian legal review.
          </p>
        </div>
      </div>
    </footer>
  );
}
