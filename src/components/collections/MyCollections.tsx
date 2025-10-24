import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollections } from '@/hooks/useCollections';
import { useAuth } from '@/hooks/useAuth';
import { CreateCollectionDialog } from './CreateCollectionDialog';
import { MyCollectionCard } from './MyCollectionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const MyCollections = () => {
  const { user } = useAuth();
  const { collections, isLoading } = useCollections(user?.id);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Collections</h1>
          <p className="text-muted-foreground mt-1">
            Organize and manage your favorite designs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-accent' : ''}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-accent' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({collections.length})</TabsTrigger>
          <TabsTrigger value="public">
            Public ({collections.filter(c => c.is_public).length})
          </TabsTrigger>
          <TabsTrigger value="private">
            Private ({collections.filter(c => !c.is_public).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't created any collections yet
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Collection
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {collections.map((collection) => (
                <MyCollectionCard
                  key={collection.id}
                  collection={collection}
                  viewMode={viewMode}
                  onClick={() => navigate(`/my-collections/${collection.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {collections.filter(c => c.is_public).map((collection) => (
              <MyCollectionCard
                key={collection.id}
                collection={collection}
                viewMode={viewMode}
                onClick={() => navigate(`/my-collections/${collection.id}`)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="private" className="mt-6">
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {collections.filter(c => !c.is_public).map((collection) => (
              <MyCollectionCard
                key={collection.id}
                collection={collection}
                viewMode={viewMode}
                onClick={() => navigate(`/my-collections/${collection.id}`)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};
