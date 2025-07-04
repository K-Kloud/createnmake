import React from 'react';
import { DynamicContent } from '../DynamicContent';
import { MainLayout } from '@/components/layouts/MainLayout';

interface LandingPageProps {
  pageConfig?: any;
}

const LandingPage: React.FC<LandingPageProps> = ({ pageConfig = {} }) => {
  return (
    <MainLayout
      seo={{
        title: pageConfig.title || "Landing Page",
        description: pageConfig.description || "Custom landing page"
      }}
    >
      <div className="min-h-screen">
        <DynamicContent 
          blockKey={pageConfig.contentBlockKey} 
          locale={pageConfig.locale || 'en'}
        />
      </div>
    </MainLayout>
  );
};

export default LandingPage;