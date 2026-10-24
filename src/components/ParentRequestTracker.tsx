'use client';

import React, { useState, useEffect } from 'react';
import { SearchIcon, CheckCircleIcon, ClockIcon, ShieldCheckIcon } from '@/components/Icons';

interface TrackerData {
  reference_number: string;
  parent_name_masked: string;
  status: string;
  status_label: string;
  subjects: string[];
  grade_level: string;
  curriculum: string;
  teaching_mode: string;
  sub_city: string;
  general_area?: string;
  preferred_days?: string[];
  preferred_time_windows?: string[];
  created_at: string;
  matched_candidates_count: number;
}

export function ParentRequestTracker({ initialRef }: { initialRef?: string }) {
  const [refInput, setRefInput] = useState(initialRef || '');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackerData | null>(null);

  const fetchStatus = async (refToFetch: string, phoneToFetch?: string) => {
    if (!refToFetch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('ref', refToFetch.trim());
      if (phoneToFetch?.trim()) params.set('phone', phoneToFetch.trim());

      const res = await fetch(`/api/parent/request-status?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Request reference not found');
        setData(null);
      } else {
        setData(json.request);
        setError(null);
      }
    } catch {
      setError('Network connection error. Please try again.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchStatus(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(refInput, phoneInput);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 text-left space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs">
            BT
          </div>
          <h2 className="text-sm font-bold text-slate-900">Track Tutoring Request</h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">Live Coordination Status</span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
        <div className="sm:col-span-6">
          <label className="block font-semibold text-slate-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            placeholder="e.g. BT-REQ-2026-0001"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            required
          />
        </div>
        <div className="sm:col-span-4">
          <label className="block font-semibold text-slate-700 mb-1">
            Registered Phone <span className="font-normal text-slate-600">(Optional)</span>
          </label>
          <input
            type="tel"
            placeholder="09... or 07..."
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
          />
        </div>
        <div className="sm:col-span-2 flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            {loading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <SearchIcon className="w-3.5 h-3.5" />
                <span>Track</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <span className="font-bold">Notice:</span> {error}
        </div>
      )}

      {data && (
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                Reference
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {data.reference_number}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {data.status_label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-600 text-[10px] block">Student Grade</span>
              <span className="font-semibold text-slate-900">{data.grade_level}</span>
            </div>
            <div>
              <span className="text-slate-600 text-[10px] block">Location</span>
              <span className="font-semibold text-slate-900">
                {data.sub_city} {data.general_area ? `(${data.general_area})` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-600 text-[10px] block">Mode</span>
              <span className="font-semibold text-slate-900 capitalize">{data.teaching_mode}</span>
            </div>
            <div>
              <span className="text-slate-600 text-[10px] block">Matched Tutors</span>
              <span className="font-semibold text-emerald-700">
                {data.matched_candidates_count > 0
                  ? `${data.matched_candidates_count} tutor(s) shortlisted`
                  : 'Coordinator screening'}
              </span>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-slate-600 text-[10px] block mb-1">Subjects</span>
            <div className="flex flex-wrap gap-1">
              {data.subjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-800"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
            <ClockIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>Logged on {new Date(data.created_at).toLocaleDateString()}</span>
            <span className="mx-1">•</span>
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Private data protected</span>
          </div>
        </div>
      )}
    </div>
  );
}
