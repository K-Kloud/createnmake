import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SimpleCollections } from '@/components/collections/SimpleCollections';

const CollectionsPage = () => {
  return (
    <MainLayout
      seo={{
        title: "My Collections - Organize Your Favorite Designs",
        description: "Manage your favorite images and personal design collections.",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <SimpleCollections />
      </div>
    </MainLayout>
  );
};

export default CollectionsPage;