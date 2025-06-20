
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '@/pages/Admin';
import AdminScheduledJobsPage from '@/pages/AdminScheduledJobs';

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminPage />} />
      <Route path="/scheduled-jobs" element={<AdminScheduledJobsPage />} />
    </Routes>
  );
};
