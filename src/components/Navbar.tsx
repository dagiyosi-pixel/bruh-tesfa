'use client';

// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Premium Global Navigation Header
// Compact, accessible, and session-aware for tutors and visitors.
// =============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, XIcon, TelegramIcon, GraduationCapIcon } from './Icons';
import { DEFAULT_TELEGRAM_COMMUNITY_URL } from '@/lib/constants';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tutorSession, setTutorSession] = useState<{ displayName: string; status: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/tutors/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.tutor) {
          setTutorSession({
            displayName: data.tutor.public_display_name,
            status: data.tutor.status,
          });
        } else {
          setTutorSession(null);
        }
      })
      .catch(() => setTutorSession(null));
  }, [pathname]);

  const navLinks = [
    { label: 'Find a Tutor', href: '/tutors' },
    { label: 'Vacancies', href: '/vacancies' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Safety & Trust', href: '/safety' },
    { label: 'Become a Tutor', href: '/become-a-tutor' },
    { label: 'About', href: '/about' },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro-announcement banner */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-[11px] sm:text-xs">
              Vetted tutor screening & home placement across Addis Ababa
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <a
              href={DEFAULT_TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors"
            >
              <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>@bruh_tesfa_tutoring_ethiopia</span>
            </a>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {tutorSession ? (
              <Link
                href="/tutors/schedule"
                className="flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Portal ({tutorSession.displayName})</span>
              </Link>
            ) : (
              <Link
                href="/tutors/schedule"
                className="text-slate-300 hover:text-white font-medium"
              >
                Tutor Portal
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
              <GraduationCapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                  BRUH TESFA
                </span>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  ብሩህ ተስፋ
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none">
                Ethiopian Tutor Matching Service
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-50 text-amber-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Primary CTA and Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {tutorSession ? (
              <Link
                href="/tutors/schedule"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 border border-amber-300 text-amber-950 hover:bg-amber-100 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>My Portal</span>
              </Link>
            ) : (
              <Link
                href="/tutors/schedule"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                Tutor Login
              </Link>
            )}

            <Link
              href="/request-tutor"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-sm shadow-amber-600/30 transition-all"
            >
              Request a Tutor
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/request-tutor"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs"
            >
              Request
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    active
                      ? 'bg-amber-50 text-amber-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2.5">
            <Link
              href="/request-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
            >
              Request a Tutor
            </Link>
            <Link
              href="/tutors/schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl font-semibold text-xs text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200"
            >
              {tutorSession ? `Tutor Portal (${tutorSession.displayName})` : 'Tutor Portal & Schedule'}
            </Link>
            <a
              href={DEFAULT_TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
            >
              <TelegramIcon className="w-4 h-4 text-sky-500" />
              <span>Join Telegram Community</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
