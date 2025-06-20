
import React from 'react';
import { PageLayout } from '@/components/layouts/PageLayout';
import { ScheduledJobs } from '@/components/admin/ScheduledJobs';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const AdminScheduledJobsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <ScheduledJobs />
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default AdminScheduledJobsPage;
