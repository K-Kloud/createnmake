import React from 'react';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <UserDashboard />
    </div>
  );
};