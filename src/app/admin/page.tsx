import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth';
import {
  getAdminMetrics,
  getAdminTutorApplications,
  getAdminParentRequests,
  getAdminMatches,
  getAdminPlacements,
  getFeeConfig,
  getAdminComplaints,
  getAuditLogs,
  getAdminVacancies,
  getAllVacancyApplications,
  getStorageProviderInfo,
} from '@/lib/db/storage';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    redirect('/admin/login');
  }

  const [
    metrics,
    tutors,
    requests,
    matches,
    placements,
    feeConfig,
    complaints,
    auditLogs,
    vacancies,
    vacancyApplications,
  ] = await Promise.all([
    getAdminMetrics(),
    getAdminTutorApplications(),
    getAdminParentRequests(),
    getAdminMatches(),
    getAdminPlacements(),
    getFeeConfig(),
    getAdminComplaints(),
    getAuditLogs(),
    getAdminVacancies(),
    getAllVacancyApplications(),
  ]);

  const storageInfo = getStorageProviderInfo();

  return (
    <AdminDashboard
      initialMetrics={metrics}
      initialTutors={tutors}
      initialRequests={requests}
      initialMatches={matches}
      initialPlacements={placements}
      initialFeeConfig={feeConfig}
      initialComplaints={complaints}
      initialAuditLogs={auditLogs}
      initialVacancies={vacancies}
      initialVacancyApplications={vacancyApplications}
      initialStorageInfo={storageInfo}
    />
  );
}
