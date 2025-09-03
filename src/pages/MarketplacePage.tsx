import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { EnhancedMarketplace } from '@/components/marketplace/EnhancedMarketplace';

const MarketplacePage = () => {
  return (
    <MainLayout
      seo={{
        title: "Fashion Marketplace - Discover Trending Designs",
        description: "Browse, discover and shop amazing AI-generated fashion designs from our creative community.",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <EnhancedMarketplace />
      </div>
    </MainLayout>
  );
};

export default MarketplacePage;