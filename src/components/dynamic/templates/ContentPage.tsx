import React from 'react';
import { DynamicContent } from '../DynamicContent';
import { MainLayout } from '@/components/layouts/MainLayout';

interface ContentPageProps {
  pageConfig?: any;
}

const ContentPage: React.FC<ContentPageProps> = ({ pageConfig = {} }) => {
  return (
    <MainLayout
      seo={{
        title: pageConfig.title || "Content Page",
        description: pageConfig.description || "Custom content page"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <DynamicContent 
          blockKey={pageConfig.contentBlockKey} 
          locale={pageConfig.locale || 'en'}
        />
      </div>
    </MainLayout>
  );
};

export default ContentPage;