import React from 'react';
import Link from 'next/link';
import { TutoringVacancy } from '@/lib/types';
import { MapPinIcon, ClockIcon, ArrowRightIcon, UsersIcon } from './Icons';

interface VacancyCardProps {
  vacancy: TutoringVacancy;
}

export default function VacancyCard({ vacancy }: VacancyCardProps) {
  const getStatusBadge = () => {
    switch (vacancy.status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Open Vacancy
          </span>
        );
      case 'closing_soon':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            Closing Soon
          </span>
        );
      case 'filled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Filled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {vacancy.status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Code, Status & Rate */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                {vacancy.vacancy_code}
              </span>
              {getStatusBadge()}
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
              {vacancy.title}
            </h3>
          </div>

          <div className="text-right shrink-0">
            <span className="text-base sm:text-lg font-extrabold text-slate-900">
              {Number(vacancy.hourly_rate_etb).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium">ETB / hr</span>
          </div>
        </div>

        {/* Grade & Location */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-800">
              {vacancy.sub_city} {vacancy.general_area ? `(${vacancy.general_area})` : ''}
            </span>
          </div>
          <div>
            <span>Grade: </span>
            <strong className="text-slate-800">{vacancy.grade_level}</strong>
          </div>
          <div>
            <span>Curriculum: </span>
            <span className="text-slate-700">{vacancy.curriculum}</span>
          </div>
        </div>

        {/* Subjects Badges */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {vacancy.subjects.map((sub) => (
              <span
                key={sub}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/60"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

        {/* Schedule & Timing Snippet */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <ClockIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{vacancy.lesson_frequency} • {vacancy.time_window || 'Afternoons'}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 font-medium text-slate-600">
            <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{vacancy.application_count} applicants</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
        {vacancy.application_deadline && (
          <span className="text-[11px] text-slate-500">
            Deadline: <strong className="text-slate-700">{vacancy.application_deadline}</strong>
          </span>
        )}
        <Link
          href={`/vacancies/${vacancy.vacancy_code}`}
          className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-xs"
        >
          <span>View & Apply</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
