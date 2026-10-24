import React from 'react';
import Link from 'next/link';
import { TutorPublicProfile } from '@/lib/types';
import { ShieldCheckIcon, MapPinIcon, GraduationCapIcon, ArrowRightIcon } from './Icons';

interface TutorCardProps {
  tutor: TutorPublicProfile;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Name, Verified badge & Rate */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
                {tutor.display_name}
              </h3>
              {tutor.is_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
              <GraduationCapIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{tutor.education_summary}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-extrabold text-slate-900">
              {Number(tutor.hourly_rate_etb).toLocaleString()}
            </span>
            <span className="text-xs text-slate-600 block font-medium">ETB / hour</span>
          </div>
        </div>

        {/* Bio snippet */}
        <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {tutor.bio}
        </p>

        {/* Subject badges */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Key Subjects
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tutor.subjects.slice(0, 4).map((sub) => (
              <span
                key={sub}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/60"
              >
                {sub}
              </span>
            ))}
            {tutor.subjects.length > 4 && (
              <span className="px-2 py-1 rounded-md text-xs text-slate-600 bg-slate-100 font-medium">
                +{tutor.subjects.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Grades & Locations */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">
              {tutor.service_areas.length > 0 ? tutor.service_areas.slice(0, 3).join(', ') : 'Addis Ababa'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
            <span className="truncate">
              {tutor.teaching_modes.map((m) => m === 'in_person' ? 'In-Person' : m === 'online' ? 'Online' : 'Hybrid').join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2.5">
        <Link
          href={`/tutors/${tutor.slug}`}
          className="flex-1 text-center py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors"
        >
          View Profile
        </Link>
        <Link
          href={`/request-tutor?tutorId=${tutor.id}&tutorName=${encodeURIComponent(tutor.display_name)}`}
          className="flex-1 text-center py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors flex items-center justify-center gap-1 shadow-xs"
        >
          <span>Select Tutor</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
