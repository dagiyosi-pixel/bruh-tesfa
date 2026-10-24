'use client';

// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Addis Ababa Sefer (Neighborhood) & Landmark Search
// =============================================================================
// Allows parents and tutors to search by informal neighborhood (ሰፈር),
// popular taxi drops, and famous landmarks in either English or Amharic,
// while automatically resolving the administrative Sub-City (ክፍለ ከተማ).
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  ADDIS_ABABA_SEFERS,
  searchSefers,
  SeferItem,
  POPULAR_SEFER_CHIPS,
} from '@/lib/sefers';
import { SubCityName, ADDIS_ABABA_SUB_CITIES_DIRECTORY } from '@/lib/constants';
import { MapPinIcon, SearchIcon, CheckCircleIcon } from './Icons';

interface SeferSearchSelectorProps {
  value: string;
  selectedSubCity?: string;
  onSelect: (seferName: string, subCity: SubCityName) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
}

export default function SeferSearchSelector({
  value,
  selectedSubCity,
  onSelect,
  label = 'Choose Sefer (ሰፈር) / Taxi Drop',
  placeholder = 'Type neighborhood or taxi drop (e.g. Mexico, 4 Kilo, CMC, Sarbet, ጀሞ)...',
  required = false,
  helperText = 'Search by the everyday name taxi drivers and residents use across Addis Ababa.',
}: SeferSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SeferItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const filtered = searchSefers(searchTerm, { limit: 12 });
    setResults(filtered);
  }, [searchTerm]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSefer = (item: SeferItem) => {
    setSearchTerm(item.name);
    setIsOpen(false);
    onSelect(item.name, item.subCity);
  };

  const handleCustomInput = (customValue: string) => {
    setSearchTerm(customValue);
    setIsOpen(true);
    // If empty or custom, attempt to resolve closest sub-city
    const matched = searchSefers(customValue, { limit: 1 })[0];
    if (matched) {
      onSelect(customValue, matched.subCity);
    }
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {selectedSubCity && (
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
            <MapPinIcon className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Kifle Ketema: <strong>{selectedSubCity}</strong></span>
            {ADDIS_ABABA_SUB_CITIES_DIRECTORY[selectedSubCity as SubCityName]?.amharic && (
              <span className="text-amber-700/80">
                ({ADDIS_ABABA_SUB_CITIES_DIRECTORY[selectedSubCity as SubCityName].amharic})
              </span>
            )}
          </span>
        )}
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleCustomInput(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 placeholder:text-slate-400 font-medium"
        />
        <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setIsOpen(true);
            }}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-100">
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            <span>
              {searchTerm ? `Found ${results.length} Sefers matching "${searchTerm}"` : 'Famous Addis Ababa Sefers & Taxi Drops'}
            </span>
            <span className="text-amber-700 lowercase font-normal">Select to auto-map sub-city</span>
          </div>

          {results.length > 0 ? (
            results.map((item) => {
              const isSelected = searchTerm.toLowerCase() === item.name.toLowerCase();
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleSelectSefer(item)}
                  className={`w-full text-left p-3 hover:bg-amber-50/70 transition-colors flex items-start justify-between gap-3 ${
                    isSelected ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{item.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                        {item.amharic}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {item.subCity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>🚖 Taxi drop / landmark:</span>
                      <span className="text-slate-700 font-medium">{item.taxiDropOrLandmark}</span>
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs text-slate-600">
                No standard Sefer matched &ldquo;<strong>{searchTerm}</strong>&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-amber-700 font-bold hover:underline"
              >
                Use &ldquo;{searchTerm}&rdquo; as a custom location
              </button>
            </div>
          )}
        </div>
      )}

      {/* Popular Quick-Pick Chips */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
          <span>Popular Addis Sefers (Click to auto-select):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SEFER_CHIPS.map((chip) => {
            const isChipSelected = searchTerm.toLowerCase().includes(chip.toLowerCase());
            return (
              <button
                type="button"
                key={chip}
                onClick={() => {
                  const item = searchSefers(chip, { limit: 1 })[0];
                  if (item) {
                    handleSelectSefer(item);
                  } else {
                    setSearchTerm(chip);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isChipSelected
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200/80'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
