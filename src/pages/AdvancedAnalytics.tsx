import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdvancedAnalyticsPanel } from '@/components/analytics/AdvancedAnalyticsPanel';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent } from '@/components/ui/card';

const AdvancedAnalytics = () => {
  const { isAuthenticated } = useAuthGuard();
  const { isAdmin, isLoading } = useAdminAccess();

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p>Loading...</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p>Access denied. Admin privileges required.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <AdvancedAnalyticsPanel />
      </main>
      <Footer />
    </div>
  );
};

export default AdvancedAnalytics;