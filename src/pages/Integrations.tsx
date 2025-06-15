
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { IntegrationsDashboard } from '@/components/integrations/IntegrationsDashboard';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Card, CardContent } from '@/components/ui/card';

const Integrations = () => {
  const { isAuthenticated } = useAuthGuard();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p>Please sign in to access integrations.</p>
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
        <IntegrationsDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Integrations;
