import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { EnhancedUserPreferences } from '@/components/preferences/EnhancedUserPreferences';
import { UserActivityFeed } from '@/components/social/UserActivityFeed';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

const PreferencesPage: React.FC = () => {
  return (
    <MainLayout
      seo={{
        title: "Preferences | OpenTeknologies",
        description: "Customize your OpenTeknologies experience with personalized settings and preferences.",
      }}
    >
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EnhancedUserPreferences />
          </div>
          <div className="space-y-6">
            <UserActivityFeed />
          </div>
        </div>
      </div>
      <PWAInstallPrompt />
    </MainLayout>
  );
};

export default PreferencesPage;