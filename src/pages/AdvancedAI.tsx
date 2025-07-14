import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AdvancedAIDashboard } from '@/components/advanced-ai/AdvancedAIDashboard';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';

const AdvancedAI = () => {
  const { isAdmin, isLoading, session } = useAdminAccess();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('AdvancedAI - Session:', session);
    console.log('AdvancedAI - IsAdmin:', isAdmin);
    console.log('AdvancedAI - IsLoading:', isLoading);
    console.log('AdvancedAI - Current URL:', window.location.pathname);
  }, [session, isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to access the Advanced AI features.</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You don't have administrator privileges to access this page.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
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