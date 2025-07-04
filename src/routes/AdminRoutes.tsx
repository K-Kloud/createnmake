
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '@/pages/Admin';
import AdminScheduledJobsPage from '@/pages/AdminScheduledJobs';
import AdminAIAgentsPage from '@/pages/AdminAIAgents';
import { SystemManagement } from '@/components/admin/SystemManagement';

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminPage />} />
      <Route path="/scheduled-jobs" element={<AdminScheduledJobsPage />} />
      <Route path="/ai-agents" element={<AdminAIAgentsPage />} />
      <Route path="/system" element={<SystemManagement />} />
    </Routes>
  );
};
