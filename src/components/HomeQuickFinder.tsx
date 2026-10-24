'use client';

// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Fast Homepage Tutor Finder
// Streamlines finding and requesting a vetted tutor in Addis Ababa in 3 easy steps.
// =============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SUBJECTS_TAXONOMY,
  GRADE_LEVELS,
  SUB_CITIES_ADDIS_ABABA,
  POPULAR_NEIGHBORHOODS,
  SubCityName,
} from '@/lib/constants';
import { searchSefers, SeferItem } from '@/lib/sefers';
import { SearchIcon, MapPinIcon, GraduationCapIcon, BookOpenIcon, ArrowRightIcon } from './Icons';

export default function HomeQuickFinder() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [seferInput, setSeferInput] = useState('');
  const [selectedSubCity, setSelectedSubCity] = useState<SubCityName | ''>('');
  const [showSeferSuggestions, setShowSeferSuggestions] = useState(false);

  const seferSuggestions = seferInput.trim()
    ? searchSefers(seferInput, { limit: 5 })
    : [];

  const handleSelectSefer = (item: SeferItem) => {
    setSeferInput(item.name);
    setSelectedSubCity(item.subCity);
    setShowSeferSuggestions(false);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedGrade) params.set('grade', selectedGrade);
    if (seferInput) params.set('sefer', seferInput);
    if (selectedSubCity) params.set('subCity', selectedSubCity);

    router.push(`/request-tutor?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-amber-900/5 border border-slate-200/90 p-4 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Quick Tutor Match
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Find the Right Home Tutor in Seconds
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
          ✓ Verified In-Person & Online
        </span>
      </div>

      <form onSubmit={handleQuickSearch} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Subject Dropdown */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <BookOpenIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Subject</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            >
              <option value="">Any Subject / All Subjects</option>
              {SUBJECTS_TAXONOMY.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Level Dropdown */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <GraduationCapIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Student&apos;s Grade</span>
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            >
              <option value="">Select Grade Level</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Neighborhood (Sefer) Input */}
          <div className="space-y-1 relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <MapPinIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Sefer (ሰፈር) / Area</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Mexico, Bole, CMC, Sarbet..."
                value={seferInput}
                onChange={(e) => {
                  setSeferInput(e.target.value);
                  setShowSeferSuggestions(true);
                  const matched = searchSefers(e.target.value, { limit: 1 })[0];
                  if (matched) setSelectedSubCity(matched.subCity);
                }}
                onFocus={() => setShowSeferSuggestions(true)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
              {selectedSubCity && (
                <span className="absolute right-2.5 top-2.5 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                  {selectedSubCity}
                </span>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {showSeferSuggestions && seferSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {seferSuggestions.map((item) => (
                  <button
                    key={`${item.name}-${item.subCity}`}
                    type="button"
                    onClick={() => handleSelectSefer(item)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50/70 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{item.name}</span>
                      {item.amharic && (
                        <span className="text-slate-500 ml-1.5">({item.amharic})</span>
                      )}
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {item.subCity}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Button & Fast Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span className="font-medium">Popular areas:</span>
            {['Mexico', 'Bole', 'CMC', 'Sarbet', '4 Kilo'].map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => {
                  setSeferInput(area);
                  const matched = searchSefers(area, { limit: 1 })[0];
                  if (matched) setSelectedSubCity(matched.subCity);
                }}
                className="text-xs text-slate-700 hover:text-amber-700 underline decoration-slate-300 hover:decoration-amber-500"
              >
                {area}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-md shadow-amber-600/20 transition-all min-h-[42px]"
          >
            <span>Request Tutor Now</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
