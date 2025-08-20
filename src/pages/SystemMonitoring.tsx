
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SystemMonitor } from '@/components/monitoring/SystemMonitor';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent } from '@/components/ui/card';

const SystemMonitoring = () => {
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">System Monitoring</h1>
            <p className="text-muted-foreground">Monitor system health and performance metrics</p>
          </div>
          <SystemMonitor />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SystemMonitoring;
