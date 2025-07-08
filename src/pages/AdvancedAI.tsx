import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AdvancedAIDashboard } from '@/components/advanced-ai/AdvancedAIDashboard';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AdvancedAI = () => {
  const { isAdmin, isLoading } = useAdminAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      seo={{
        title: "Advanced AI Features",
        description: "AI-powered recommendations, content generation, and personalization tools.",
        noIndex: true,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <AdvancedAIDashboard />
      </div>
    </MainLayout>
  );
};

export default AdvancedAI;