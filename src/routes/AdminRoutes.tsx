
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load Admin pages
const AdminPage = lazy(() => import('@/pages/Admin'));
const AdminScheduledJobsPage = lazy(() => import('@/pages/AdminScheduledJobs'));
const AdminAIAgentsPage = lazy(() => import('@/pages/AdminAIAgents'));
const AdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
const RealtimeDashboard = lazy(() => import('@/pages/RealtimeDashboard'));
const AdvancedAI = lazy(() => import('@/pages/AdvancedAI'));
const SystemManagement = lazy(() => import('@/components/admin/SystemManagement').then(module => ({ default: module.SystemManagement })));

export const AdminRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/scheduled-jobs" element={<AdminScheduledJobsPage />} />
        <Route path="/ai-agents" element={<AdminAIAgentsPage />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="/realtime" element={<RealtimeDashboard />} />
        <Route path="/advanced-ai" element={<AdvancedAI />} />
        <Route path="/system" element={<SystemManagement />} />
      </Routes>
    </Suspense>
  );
};
