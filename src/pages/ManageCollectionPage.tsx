import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Settings, Check, X } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { useCollections } from '@/hooks/useCollections';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CollectionImageGrid } from '@/components/collections/CollectionImageGrid';
import { BulkActionsToolbar } from '@/components/collections/BulkActionsToolbar';
import { EditCollectionDialog } from '@/components/collections/EditCollectionDialog';
import { CollectionStats } from '@/components/collections/CollectionStats';

export const ManageCollectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { collections, removeFromCollection, bulkRemove } = useCollections(user?.id);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const collection = collections.find((c) => c.id === id);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['collection-images', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_images')
        .select(`
          image_id,
          generated_images (
            id,
            image_url,
            prompt,
            item_type,
            created_at
          )
        `)
        .eq('collection_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((item: any) => item.generated_images).filter(Boolean);
    },
    enabled: !!id,
  });

  const handleToggleSelect = (imageId: number) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map((img: any) => img.id)));
    }
  };

  const handleBulkRemove = () => {
    if (id && selectedImages.size > 0) {
      bulkRemove({
        collectionId: id,
        imageIds: Array.from(selectedImages),
      });
      setSelectedImages(new Set());
    }
  };

  if (!collection) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Collection not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      seo={{
        title: `Manage ${collection.name}`,
        description: collection.description || 'Manage your collection',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/my-collections')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            {collection.description && (
              <p className="text-muted-foreground mt-1">{collection.description}</p>
            )}
          </div>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {collection.is_public && (
          <div className="mb-6">
            <CollectionStats collectionId={collection.id} />
          </div>
        )}

        {selectedImages.size > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedImages.size}
            totalCount={images.length}
            onSelectAll={handleSelectAll}
            onClearSelection={() => setSelectedImages(new Set())}
            onRemove={handleBulkRemove}
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              This collection is empty. Start adding images from the marketplace!
            </p>
          </div>
        ) : (
          <CollectionImageGrid
            images={images}
            selectedImages={selectedImages}
            onToggleSelect={handleToggleSelect}
            onRemove={(imageId) => {
              if (id) {
                removeFromCollection({ collectionId: id, imageId });
              }
            }}
          />
        )}

        <EditCollectionDialog
          collection={collection}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      </div>
    </MainLayout>
  );
};

export default ManageCollectionPage;
