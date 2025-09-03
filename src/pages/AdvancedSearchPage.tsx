import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';

const AdvancedSearchPage = () => {
  return (
    <MainLayout
      seo={{
        title: "Advanced Search - Discover Amazing Designs",
        description: "Search and filter through thousands of AI-generated fashion designs with advanced search capabilities.",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <AdvancedSearch />
      </div>
    </MainLayout>
  );
};

export default AdvancedSearchPage;