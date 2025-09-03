import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { StyleRecommendations } from '@/components/recommendations/StyleRecommendations';

const RecommendationsPage = () => {
  return (
    <MainLayout
      seo={{
        title: "Style Recommendations - Personalized Design Ideas",
        description: "Get personalized style recommendations based on your preferences and trending designs.",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <StyleRecommendations />
      </div>
    </MainLayout>
  );
};

export default RecommendationsPage;