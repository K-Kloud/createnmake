import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AdvancedAnalyticsPanel } from '@/components/analytics/AdvancedAnalyticsPanel';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AdminAnalytics = () => {
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
        title: "Advanced Analytics Dashboard",
        description: "Comprehensive analytics with funnels, A/B testing, heatmaps, and AI insights.",
        noIndex: true,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into user behavior, conversion funnels, and performance metrics.
          </p>
        </div>
        
        <AdvancedAnalyticsPanel />
      </div>
    </MainLayout>
  );
};

export default AdminAnalytics;