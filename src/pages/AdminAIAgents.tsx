import React from 'react';
import { PageLayout } from '@/components/layouts/PageLayout';
import { AIAgentDashboard } from '@/components/admin/AIAgentDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent } from '@/components/ui/card';

const AdminAIAgentsPage: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAccess();

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p>Loading...</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p>Access denied. Admin privileges required.</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <AIAgentDashboard />
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default AdminAIAgentsPage;