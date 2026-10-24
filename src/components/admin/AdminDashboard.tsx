'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminMetrics,
  TutorApplication,
  ParentRequest,
  MatchProposal,
  Placement,
  FeeConfiguration,
  Complaint,
  AuditLog,
  CandidateMatch,
  ApplicationStatus,
  ParentRequestStatus,
  PaymentStatus,
} from '@/lib/types';
import {
  ShieldCheckIcon,
  UsersIcon,
  BookOpenIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  FileTextIcon,
  DownloadIcon,
  GraduationCapIcon,
  ArrowRightIcon,
  SlidersIcon,
} from '../Icons';

interface AdminDashboardProps {
  initialMetrics: AdminMetrics;
  initialTutors: TutorApplication[];
  initialRequests: ParentRequest[];
  initialMatches: MatchProposal[];
  initialPlacements: Placement[];
  initialFeeConfig: FeeConfiguration;
  initialComplaints: Complaint[];
  initialAuditLogs: AuditLog[];
}

export default function AdminDashboard({
  initialMetrics,
  initialTutors,
  initialRequests,
  initialMatches,
  initialPlacements,
  initialFeeConfig,
  initialComplaints,
  initialAuditLogs,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'tutors' | 'requests' | 'placements' | 'complaints' | 'fee-config' | 'audit'>('overview');

  // State collections
  const [metrics, setMetrics] = useState<AdminMetrics>(initialMetrics);
  const [tutors, setTutors] = useState<TutorApplication[]>(initialTutors);
  const [requests, setRequests] = useState<ParentRequest[]>(initialRequests);
  const [matches, setMatches] = useState<MatchProposal[]>(initialMatches);
  const [placements, setPlacements] = useState<Placement[]>(initialPlacements);
  const [feeConfig, setFeeConfig] = useState<FeeConfiguration>(initialFeeConfig);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Modal & Selection States
  const [selectedTutor, setSelectedTutor] = useState<TutorApplication | null>(null);
  const [tutorReviewNotes, setTutorReviewNotes] = useState('');
  const [tutorActionStatus, setTutorActionStatus] = useState<ApplicationStatus>('approved');

  const [selectedRequest, setSelectedRequest] = useState<ParentRequest | null>(null);
  const [requestStatusUpdate, setRequestStatusUpdate] = useState<ParentRequestStatus>('reviewing');
  const [requestAdminNotes, setRequestAdminNotes] = useState('');

  // Matcher state
  const [matcherCandidates, setMatcherCandidates] = useState<CandidateMatch[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [matcherRequest, setMatcherRequest] = useState<ParentRequest | null>(null);

  // Placement creation modal
  const [newPlacementModal, setNewPlacementModal] = useState<{
    isOpen: boolean;
    matchId: string;
    agreedRate: number;
    contractType: 'first_month_recurring' | 'package_hours' | 'single_lesson';
    lessonsPerWeek: number;
    hoursPerLesson: number;
    startDate: string;
  }>({
    isOpen: false,
    matchId: '',
    agreedRate: 400,
    contractType: 'first_month_recurring',
    lessonsPerWeek: 3,
    hoursPerLesson: 1.5,
    startDate: new Date().toISOString().slice(0, 10),
  });

  // Placement payment update modal
  const [paymentUpdateModal, setPaymentUpdateModal] = useState<{
    isOpen: boolean;
    placementId: string;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    paymentReference: string;
    followUpStatus: Placement['follow_up_status'];
    followUpNotes: string;
  }>({
    isOpen: false,
    placementId: '',
    paymentStatus: 'paid',
    paymentMethod: 'CBE Birr',
    paymentReference: '',
    followUpStatus: 'first_lesson_completed',
    followUpNotes: '',
  });

  // Complaint modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintResolutionNotes, setComplaintResolutionNotes] = useState('');

  // Filter states
  const [tutorFilterStatus, setTutorFilterStatus] = useState<string>('all');
  const [tutorSearch, setTutorSearch] = useState('');

  // Actions
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleUpdateTutorStatus = async (id: string) => {
    try {
      const res = await fetch('/api/admin/tutors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: tutorActionStatus,
          adminReviewNotes: tutorReviewNotes,
        }),
      });
      const data = await res.json();
      if (data.success && data.tutor) {
        setTutors((prev) => prev.map((t) => (t.id === id ? data.tutor : t)));
        setSelectedTutor(null);
        refreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRequestStatus = async (id: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: requestStatusUpdate,
          adminNotes: requestAdminNotes,
        }),
      });
      const data = await res.json();
      if (data.success && data.request) {
        setRequests((prev) => prev.map((r) => (r.id === id ? data.request : r)));
        setSelectedRequest(null);
        refreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFindCandidates = async (req: ParentRequest) => {
    setMatcherRequest(req);
    setLoadingCandidates(true);
    setMatcherCandidates([]);
    try {
      const res = await fetch(`/api/admin/candidates?requestId=${req.id}`);
      const data = await res.json();
      if (data.success) {
        setMatcherCandidates(data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleProposeMatch = async (tutorId: string, score: number) => {
    if (!matcherRequest) return;
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: matcherRequest.id,
          tutorId,
          matchScore: score,
          notes: 'Candidate match proposed via admin dashboard',
        }),
      });
      const data = await res.json();
      if (data.success && data.match) {
        setMatches((prev) => [data.match, ...prev]);
        setRequests((prev) =>
          prev.map((r) => (r.id === matcherRequest.id ? { ...r, status: 'candidates_proposed' } : r))
        );
        alert(`Match proposal recorded for ${matcherRequest.reference_number}!`);
        setMatcherRequest(null);
        refreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlacement = async () => {
    try {
      const res = await fetch('/api/admin/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: newPlacementModal.matchId,
          agreedHourlyRateETB: newPlacementModal.agreedRate,
          contractType: newPlacementModal.contractType,
          lessonsPerWeek: newPlacementModal.lessonsPerWeek,
          hoursPerLesson: newPlacementModal.hoursPerLesson,
          startDate: newPlacementModal.startDate,
        }),
      });
      const data = await res.json();
      if (data.success && data.placement) {
        setPlacements((prev) => [data.placement, ...prev]);
        setNewPlacementModal((prev) => ({ ...prev, isOpen: false }));
        refreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      const res = await fetch('/api/admin/placements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: paymentUpdateModal.placementId,
          paymentStatus: paymentUpdateModal.paymentStatus,
          paymentMethod: paymentUpdateModal.paymentMethod,
          paymentReference: paymentUpdateModal.paymentReference,
          followUpStatus: paymentUpdateModal.followUpStatus,
          followUpNotes: paymentUpdateModal.followUpNotes,
        }),
      });
      const data = await res.json();
      if (data.success && data.placement) {
        setPlacements((prev) => prev.map((p) => (p.id === data.placement.id ? data.placement : p)));
        setPaymentUpdateModal((prev) => ({ ...prev, isOpen: false }));
        refreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveComplaint = async (id: string) => {
    try {
      const res = await fetch('/api/admin/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          resolutionNotes: complaintResolutionNotes,
          status: 'resolved',
        }),
      });
      const data = await res.json();
      if (data.success && data.complaint) {
        setComplaints((prev) => prev.map((c) => (c.id === id ? data.complaint : c)));
        setSelectedComplaint(null);
        refreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch {
      // ignore
    }
  };

  // Filtered tutors
  const filteredTutors = tutors.filter((t) => {
    if (tutorFilterStatus !== 'all' && t.status !== tutorFilterStatus) return false;
    if (tutorSearch) {
      const q = tutorSearch.toLowerCase();
      const matchName = t.full_legal_name.toLowerCase().includes(q) || t.public_display_name.toLowerCase().includes(q);
      const matchSub = t.subjects.some((s) => s.toLowerCase().includes(q));
      const matchRef = t.reference_number.toLowerCase().includes(q);
      return matchName || matchSub || matchRef;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Top Navigation */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-bold text-white text-sm">
              BT
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">BRUH TESFA</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                Staff Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Operator: <strong className="text-slate-200">Bruh Tesfa Staff Admin</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 py-2 text-xs font-medium border-t border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            KPI Overview
          </button>
          <button
            onClick={() => setActiveTab('tutors')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'tutors' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutor Applications ({tutors.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'requests' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Parent Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('placements')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'placements' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Placements & 60% Fees ({placements.length})
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'complaints' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safeguarding Log ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('fee-config')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'fee-config' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fee Settings
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'audit' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: OVERVIEW & REAL METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Platform Performance</h1>
              <p className="text-xs text-slate-500">Live operational counts from persistent database.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold uppercase block">Total Tutors</span>
                <span className="text-2xl font-black text-slate-900">{metrics.totalTutorApplications}</span>
                <span className="text-[11px] text-amber-600 block mt-1">{metrics.pendingTutorReviews} pending review</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold uppercase block">Approved Tutors</span>
                <span className="text-2xl font-black text-emerald-700">{metrics.approvedTutors}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Live in public directory</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold uppercase block">Parent Requests</span>
                <span className="text-2xl font-black text-slate-900">{metrics.totalParentRequests}</span>
                <span className="text-[11px] text-sky-600 block mt-1">{metrics.activeRequests} active coordination</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold uppercase block">Active Matches</span>
                <span className="text-2xl font-black text-amber-600">{metrics.activeMatches}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Introduced to families</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold uppercase block">Total Placements</span>
                <span className="text-2xl font-black text-slate-900">{metrics.totalPlacements}</span>
                <span className="text-[11px] text-emerald-600 block mt-1">
                  {metrics.totalPlacementValueETB.toLocaleString()} ETB volume
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold uppercase block">60% Fee Collected</span>
                <span className="text-2xl font-black text-emerald-600">
                  {metrics.totalCommissionPaidETB.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  of {metrics.totalCommissionDueETB.toLocaleString()} ETB due
                </span>
              </div>
            </div>

            {/* Quick Actions & CSV Exports */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Operational Shortcuts & Exports
              </h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/api/admin/export?type=placements"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <DownloadIcon className="w-4 h-4 text-slate-500" />
                  <span>Export Placements CSV</span>
                </a>
                <a
                  href="/api/admin/export?type=requests"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <DownloadIcon className="w-4 h-4 text-slate-500" />
                  <span>Export Parent Requests CSV</span>
                </a>
                <a
                  href="/api/admin/export?type=tutors"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <DownloadIcon className="w-4 h-4 text-slate-500" />
                  <span>Export Tutor Applications CSV</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TUTOR APPLICATIONS */}
        {activeTab === 'tutors' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Tutor Applications & Verification</h1>
                <p className="text-xs text-slate-500">Privately inspect credentials, manage review statuses, and publish profiles.</p>
              </div>

              {/* Status filter tabs */}
              <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                {['all', 'submitted', 'under_review', 'approved', 'needs_info', 'rejected', 'suspended'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTutorFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                      tutorFilterStatus === st ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div>
              <input
                type="text"
                placeholder="Search by legal name, display name, reference, or subject..."
                value={tutorSearch}
                onChange={(e) => setTutorSearch(e.target.value)}
                className="w-full sm:max-w-md px-4 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>

            {/* Tutors Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Full Legal Name (Private)</th>
                      <th className="p-3">Public Name</th>
                      <th className="p-3">Sub-City</th>
                      <th className="p-3">Education & Major</th>
                      <th className="p-3">Subjects</th>
                      <th className="p-3">Rate</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTutors.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-800">{t.reference_number}</td>
                        <td className="p-3 font-semibold text-slate-900">{t.full_legal_name}</td>
                        <td className="p-3 text-slate-600">{t.public_display_name}</td>
                        <td className="p-3 text-slate-600">{t.sub_city}</td>
                        <td className="p-3 text-slate-600">
                          {t.education_level} • {t.institution}
                        </td>
                        <td className="p-3 text-slate-600 max-w-[200px] truncate">{t.subjects.join(', ')}</td>
                        <td className="p-3 font-bold text-slate-800">{t.hourly_rate_etb} ETB</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              t.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : t.status === 'submitted'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : t.status === 'under_review'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedTutor(t);
                              setTutorActionStatus(t.status);
                              setTutorReviewNotes(t.admin_review_notes || '');
                            }}
                            className="px-3 py-1 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800"
                          >
                            Inspect & Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PARENT REQUESTS & MATCHING */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Parent Tutoring Requests</h1>
              <p className="text-xs text-slate-500">Review student learning goals and trigger the Candidate Matcher engine.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Parent Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Sub-City & Area</th>
                      <th className="p-3">Subjects Needed</th>
                      <th className="p-3">Grade Level</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Match Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-800">{r.reference_number}</td>
                        <td className="p-3 font-semibold text-slate-900">{r.parent_name}</td>
                        <td className="p-3 font-mono text-slate-600">{r.phone}</td>
                        <td className="p-3 text-slate-600">
                          {r.sub_city} {r.general_area ? `(${r.general_area})` : ''}
                        </td>
                        <td className="p-3 font-medium text-amber-900">{r.subjects.join(', ')}</td>
                        <td className="p-3 text-slate-600">{r.grade_level}</td>
                        <td className="p-3 capitalize">{r.teaching_mode.replace('_', ' ')}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {r.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleFindCandidates(r)}
                            className="px-3 py-1 rounded-lg font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                          >
                            Find Candidates &rarr;
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(r);
                              setRequestStatusUpdate(r.status);
                              setRequestAdminNotes(r.admin_notes || '');
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Algorithmic Matcher Drawer/Panel */}
            {matcherRequest && (
              <div className="bg-white rounded-3xl border-2 border-amber-500/40 p-6 shadow-lg space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                      Candidate Matching Engine
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      Shortlisted Candidates for {matcherRequest.parent_name} ({matcherRequest.reference_number})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Looking for: {matcherRequest.subjects.join(', ')} • {matcherRequest.grade_level} • {matcherRequest.sub_city}
                    </p>
                  </div>
                  <button
                    onClick={() => setMatcherRequest(null)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Close Matcher &times;
                  </button>
                </div>

                {loadingCandidates ? (
                  <p className="text-sm text-slate-500 text-center py-8">Scoring approved tutors against student criteria...</p>
                ) : matcherCandidates.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No approved tutors meet the minimum eligibility criteria.</p>
                ) : (
                  <div className="space-y-4">
                    {matcherCandidates.map((candidate) => {
                      const tutor = candidate.tutor as TutorApplication;
                      return (
                        <div
                          key={tutor.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 max-w-xl">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-slate-900">{tutor.public_display_name}</h3>
                              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                Match Score: {candidate.total_score}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {tutor.education_level} • {tutor.institution} • Rate: {tutor.hourly_rate_etb} ETB/hr
                            </p>
                            
                            {/* Score Breakdown Reasons */}
                            <div className="pt-1 flex flex-wrap gap-1.5">
                              {candidate.breakdown.reasons.map((reason, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
                            <button
                              onClick={() => handleProposeMatch(tutor.id, candidate.total_score)}
                              className="w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                            >
                              Propose Match &rarr;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PLACEMENTS & 60% COMMISSION RECORDS */}
        {activeTab === 'placements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Placements & 60% Placement Agreements</h1>
                <p className="text-xs text-slate-500">Track agreed teaching contracts, one-time 60% commission fees, and lesson follow-ups.</p>
              </div>

              {matches.length > 0 && (
                <button
                  onClick={() =>
                    setNewPlacementModal({
                      isOpen: true,
                      matchId: matches[0]?.id || '',
                      agreedRate: 400,
                      contractType: 'first_month_recurring',
                      lessonsPerWeek: 3,
                      hoursPerLesson: 1.5,
                      startDate: new Date().toISOString().slice(0, 10),
                    })
                  }
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs"
                >
                  + Create New Placement Agreement
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Placement ID</th>
                      <th className="p-3">Contract Basis</th>
                      <th className="p-3">Total Value</th>
                      <th className="p-3">60% Commission</th>
                      <th className="p-3">Payment Status</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">Follow-up</th>
                      <th className="p-3 text-right">Reconcile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {placements.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-800">{p.id}</td>
                        <td className="p-3 text-slate-700 max-w-xs">{p.commission_basis_description}</td>
                        <td className="p-3 font-bold text-slate-900">{Number(p.total_contract_value_etb).toLocaleString()} ETB</td>
                        <td className="p-3 font-extrabold text-amber-800">{Number(p.commission_amount_etb).toLocaleString()} ETB</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {p.payment_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{p.payment_method || 'Unrecorded'}</td>
                        <td className="p-3 text-slate-600">{p.start_date}</td>
                        <td className="p-3 text-slate-600 capitalize">{p.follow_up_status.replace('_', ' ')}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() =>
                              setPaymentUpdateModal({
                                isOpen: true,
                                placementId: p.id,
                                paymentStatus: p.payment_status,
                                paymentMethod: p.payment_method || 'CBE Birr',
                                paymentReference: p.payment_reference || '',
                                followUpStatus: p.follow_up_status,
                                followUpNotes: p.follow_up_notes || '',
                              })
                            }
                            className="px-3 py-1 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800"
                          >
                            Reconcile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMPLAINTS & SAFEGUARDING */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Safeguarding & Incident Complaints</h1>
              <p className="text-xs text-slate-500">Confidential reports logged by parents, tutors, or staff.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Reporter</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Created</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          Zero open complaints or safeguarding concerns.
                        </td>
                      </tr>
                    ) : (
                      complaints.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-800">{c.reference_number}</td>
                          <td className="p-3 capitalize">{c.reporter_type} ({c.reporter_name || 'Anonymous'})</td>
                          <td className="p-3 font-semibold text-slate-900">{c.subject}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700">
                              {c.priority}
                            </span>
                          </td>
                          <td className="p-3 capitalize">{c.status.replace('_', ' ')}</td>
                          <td className="p-3 text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedComplaint(c);
                                setComplaintResolutionNotes(c.resolution_notes || '');
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800"
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FEE CONFIGURATION */}
        {activeTab === 'fee-config' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Platform Placement Fee Parameters</h1>
              <p className="text-xs text-slate-500">Immutable baseline terms applied when generating placement contracts.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Default Placement Commission Percentage (%)
                </label>
                <input
                  type="number"
                  value={feeConfig.default_commission_percentage}
                  onChange={(e) => setFeeConfig({ ...feeConfig, default_commission_percentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Proposed model: 60% on first month contract value.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Replacement Guarantee Policy
                </label>
                <textarea
                  rows={2}
                  value={feeConfig.failure_replacement_policy}
                  onChange={(e) => setFeeConfig({ ...feeConfig, failure_replacement_policy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Continuing / Repeat Months Policy
                </label>
                <textarea
                  rows={2}
                  value={feeConfig.repeat_client_policy}
                  onChange={(e) => setFeeConfig({ ...feeConfig, repeat_client_policy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                onClick={async () => {
                  await fetch('/api/admin/fee-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(feeConfig),
                  });
                  alert('Fee configurations updated successfully!');
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800"
              >
                Save Fee Configuration
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">System Audit Trail</h1>
              <p className="text-xs text-slate-500">Immutable record of administrative actions, status updates, and placements.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Actor & Role</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Resource</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-slate-800">{log.actor} ({log.role})</td>
                        <td className="p-3 font-mono text-amber-900">{log.action}</td>
                        <td className="p-3 text-slate-600">{log.resource_type}:{log.resource_id}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Inspect Tutor Application */}
      {selectedTutor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase">Application Review</span>
                <h2 className="text-xl font-bold text-slate-900">{selectedTutor.full_legal_name}</h2>
                <p className="text-xs text-slate-500 font-mono">{selectedTutor.reference_number}</p>
              </div>
              <button onClick={() => setSelectedTutor(null)} className="text-slate-400 hover:text-slate-700 text-lg">
                &times;
              </button>
            </div>

            {/* Private Details Inspection */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Phone (Private)</span>
                <span className="font-mono font-bold text-slate-800">{selectedTutor.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Preferred Channel</span>
                <span className="font-bold text-slate-800">{selectedTutor.preferred_contact_channel}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Email (Private)</span>
                <span className="font-mono text-slate-800">{selectedTutor.email || 'None provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Sub-City & Area</span>
                <span className="font-bold text-slate-800">{selectedTutor.sub_city} ({selectedTutor.specific_neighborhood || 'N/A'})</span>
              </div>
            </div>

            {/* Academic Credential Links */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase">Verification Evidence</span>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                  National ID Path: {selectedTutor.national_id_doc_path || 'Pending upload'}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-900 border border-sky-200">
                  Degree Path: {selectedTutor.degree_cert_doc_path || 'Pending upload'}
                </span>
              </div>
            </div>

            {/* Review Decision Form */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Change Status
              </label>
              <select
                value={tutorActionStatus}
                onChange={(e) => setTutorActionStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="approved">Approve & Publish to Public Directory</option>
                <option value="under_review">Mark Under Review (Phone Interview Scheduled)</option>
                <option value="needs_info">Request More Information / Document Rescan</option>
                <option value="rejected">Reject Application</option>
                <option value="suspended">Suspend Public Profile</option>
              </select>

              <label className="block text-xs font-bold text-slate-700 uppercase pt-2">
                Administrative Notes
              </label>
              <textarea
                rows={3}
                value={tutorReviewNotes}
                onChange={(e) => setTutorReviewNotes(e.target.value)}
                placeholder="Reason for approval/rejection, verification interview remarks..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedTutor(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateTutorStatus(selectedTutor.id)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                >
                  Save Review Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Placement Agreement */}
      {newPlacementModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900">Create Placement Agreement</h2>
              <p className="text-xs text-slate-500">Calculates and locks the one-time 60% placement commission.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Select Confirmed Match</label>
                <select
                  value={newPlacementModal.matchId}
                  onChange={(e) => setNewPlacementModal({ ...newPlacementModal, matchId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      Match {m.id} (Req: {m.request_id} &rarr; Tutor: {m.tutor_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Agreed Rate (ETB / hr)</label>
                <input
                  type="number"
                  value={newPlacementModal.agreedRate}
                  onChange={(e) => setNewPlacementModal({ ...newPlacementModal, agreedRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Lessons / Week</label>
                  <input
                    type="number"
                    value={newPlacementModal.lessonsPerWeek}
                    onChange={(e) => setNewPlacementModal({ ...newPlacementModal, lessonsPerWeek: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Hours / Lesson</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPlacementModal.hoursPerLesson}
                    onChange={(e) => setNewPlacementModal({ ...newPlacementModal, hoursPerLesson: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={newPlacementModal.startDate}
                  onChange={(e) => setNewPlacementModal({ ...newPlacementModal, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Live Preview Math */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-mono text-[11px] space-y-1">
                <p>Total First Month Value: {newPlacementModal.lessonsPerWeek * newPlacementModal.hoursPerLesson * 4 * newPlacementModal.agreedRate} ETB</p>
                <p className="font-bold text-amber-800">
                  Bruh Tesfa Commission (60%): {(newPlacementModal.lessonsPerWeek * newPlacementModal.hoursPerLesson * 4 * newPlacementModal.agreedRate * 0.6).toFixed(0)} ETB
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setNewPlacementModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlacement}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700"
                >
                  Confirm & Lock Placement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reconcile Payment */}
      {paymentUpdateModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900">Reconcile Placement Commission</h2>
              <p className="text-xs text-slate-500">Record proof of payment and lesson status.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Payment Status</label>
                <select
                  value={paymentUpdateModal.paymentStatus}
                  onChange={(e) => setPaymentUpdateModal({ ...paymentUpdateModal, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="paid">Paid in Full</option>
                  <option value="due">Payment Due</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="waived_cancellation">Waived (Early Cancellation / Unmet Match)</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Payment Channel</label>
                <select
                  value={paymentUpdateModal.paymentMethod}
                  onChange={(e) => setPaymentUpdateModal({ ...paymentUpdateModal, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Telebirr">Telebirr Transfer</option>
                  <option value="CBE Birr">Commercial Bank of Ethiopia (CBE Birr)</option>
                  <option value="Awash Bank">Awash Bank Transfer</option>
                  <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                  <option value="Cash">Cash Receipt at Service Desk</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. CBE-TX-99882211 or Telebirr SMS code"
                  value={paymentUpdateModal.paymentReference}
                  onChange={(e) => setPaymentUpdateModal({ ...paymentUpdateModal, paymentReference: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Lesson Follow-Up Status</label>
                <select
                  value={paymentUpdateModal.followUpStatus}
                  onChange={(e) => setPaymentUpdateModal({ ...paymentUpdateModal, followUpStatus: e.target.value as Placement['follow_up_status'] })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="pending_first_lesson">Pending First Lesson</option>
                  <option value="first_lesson_completed">First Lesson Completed (Parent Confirmed)</option>
                  <option value="ongoing_smooth">Ongoing Smoothly</option>
                  <option value="issue_reported">Issue Reported by Family or Tutor</option>
                  <option value="concluded">Concluded Contract</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Follow-Up Notes</label>
                <textarea
                  rows={2}
                  value={paymentUpdateModal.followUpNotes}
                  onChange={(e) => setPaymentUpdateModal({ ...paymentUpdateModal, followUpNotes: e.target.value })}
                  placeholder="Parent feedback, punctuality remarks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setPaymentUpdateModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePayment}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                >
                  Save Reconciliation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit Parent Request Status */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900">Update Request Status</h2>
              <p className="text-xs text-slate-500 font-mono">{selectedRequest.reference_number} ({selectedRequest.parent_name})</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Request Status</label>
                <select
                  value={requestStatusUpdate}
                  onChange={(e) => setRequestStatusUpdate(e.target.value as ParentRequestStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="new">New (Unreviewed)</option>
                  <option value="reviewing">Reviewing (Contacting Parent)</option>
                  <option value="matching">Matching (Evaluating Candidates)</option>
                  <option value="candidates_proposed">Candidates Proposed</option>
                  <option value="matched">Matched (Trial Scheduled)</option>
                  <option value="active">Active Tutoring</option>
                  <option value="closed">Closed (Successfully Concluded)</option>
                  <option value="cancelled">Cancelled by Family</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Coordinator Notes</label>
                <textarea
                  rows={3}
                  value={requestAdminNotes}
                  onChange={(e) => setRequestAdminNotes(e.target.value)}
                  placeholder="Notes from parent call, student details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateRequestStatus(selectedRequest.id)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Resolve Complaint */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900">Resolve Safeguarding Concern</h2>
              <p className="text-xs text-slate-500 font-mono">{selectedComplaint.reference_number}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <strong>{selectedComplaint.subject}</strong>
              <p className="text-slate-600">{selectedComplaint.description}</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700 uppercase">Resolution Actions Taken</label>
              <textarea
                rows={3}
                value={complaintResolutionNotes}
                onChange={(e) => setComplaintResolutionNotes(e.target.value)}
                placeholder="Action taken, discussion with parties, resolution outcome..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolveComplaint(selectedComplaint.id)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800"
                >
                  Mark Concern Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
