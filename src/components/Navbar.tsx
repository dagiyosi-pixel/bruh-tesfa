'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, XIcon, TelegramIcon, GraduationCapIcon } from './Icons';
import { DEFAULT_TELEGRAM_COMMUNITY_URL } from '@/lib/constants';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro-announcement banner */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Active screening & placement across Addis Ababa</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tutors/schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl font-medium text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200"
            >
              Tutor Portal & Schedule
            </Link>
            <a
              href={DEFAULT_TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
            >
              <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Telegram Community</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <Link href="/tutors/schedule" className="text-amber-400 hover:text-white hidden sm:inline text-[11px] font-semibold">
              Tutor Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/20 group-hover:bg-amber-700 transition-colors">
              <GraduationCapIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                  BRUH TESFA
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  ብሩህ ተስፋ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
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
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-amber-50 text-amber-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Primary CTA and Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/request-tutor"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-sm shadow-amber-600/30 transition-all min-h-[44px]"
            >
              Request a Tutor
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/request-tutor"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
            >
              Request
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                    active
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
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
              className="w-full text-center py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
            >
              Request a Tutor
            </Link>
            <Link
              href="/tutors/schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl font-medium text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200"
            >
              Tutor Portal & Schedule
            </Link>
            <a
              href={DEFAULT_TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
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
