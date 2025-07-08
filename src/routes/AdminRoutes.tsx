
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '@/pages/Admin';
import AdminScheduledJobsPage from '@/pages/AdminScheduledJobs';
import AdminAIAgentsPage from '@/pages/AdminAIAgents';
import AdminAnalytics from '@/pages/AdminAnalytics';
import RealtimeDashboard from '@/pages/RealtimeDashboard';
import { SystemManagement } from '@/components/admin/SystemManagement';

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminPage />} />
      <Route path="/scheduled-jobs" element={<AdminScheduledJobsPage />} />
      <Route path="/ai-agents" element={<AdminAIAgentsPage />} />
      <Route path="/analytics" element={<AdminAnalytics />} />
      <Route path="/realtime" element={<RealtimeDashboard />} />
      <Route path="/system" element={<SystemManagement />} />
    </Routes>
  );
};
