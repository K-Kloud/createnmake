import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublicCollections } from '@/hooks/usePublicCollections';
import { useAuth } from '@/hooks/useAuth';
import { useInView } from 'react-intersection-observer';
import { CollectionSearch, SearchFilters } from './CollectionSearch';
import { RecommendedCollections } from './RecommendedCollections';

export const PublicCollectionsGrid = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ref, inView } = useInView();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ sortBy: 'popular' });
  
  const {
    collections,
    isLoading,
    fetchNextPage,
    hasNextPage,
    followCollection,
    unfollowCollection,
    isFollowing,
    isUnfollowing,
  } = usePublicCollections(user?.id);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Filter and sort collections
  const filteredCollections = collections.filter((collection) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = collection.name.toLowerCase().includes(query);
      const matchesDescription = collection.description?.toLowerCase().includes(query);
      const matchesCategory = collection.category?.toLowerCase().includes(query);
      const matchesTags = collection.tags?.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesName && !matchesDescription && !matchesCategory && !matchesTags) {
        return false;
      }
    }

    // Category filter
    if (filters.category && collection.category !== filters.category) {
      return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!collection.tags || !filters.tags.some(tag => collection.tags?.includes(tag))) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'recent':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'followers':
        return b.follower_count - a.follower_count;
      case 'images':
        return b.image_count - a.image_count;
      case 'popular':
      default:
        return b.follower_count - a.follower_count;
    }
  });

  if (isLoading && collections.length === 0) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-12 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="aspect-video bg-muted rounded-lg" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Recommended Collections */}
      <RecommendedCollections />

      {/* Search and Filters */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Discover Collections</h2>
        <CollectionSearch
          onSearch={setSearchQuery}
          onFilterChange={setFilters}
          placeholder="Search collections by name, category, or tags..."
        />
      </div>

      {/* Collections Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {filteredCollections.length} {filteredCollections.length === 1 ? 'Collection' : 'Collections'}
          </h3>
        </div>

        {filteredCollections.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No collections found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <Card
                key={collection.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                    {collection.cover_image_url ? (
                      <img
                        src={collection.cover_image_url}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {collection.category && (
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        {collection.category}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {collection.follower_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {collection.image_count}
                      </div>
                    </div>
                    {collection.tags && collection.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {collection.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {user && (
                      <Button
                        size="sm"
                        variant={collection.is_following ? 'default' : 'outline'}
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (collection.is_following) {
                            unfollowCollection(collection.id);
                          } else {
                            followCollection(collection.id);
                          }
                        }}
                        disabled={isFollowing || isUnfollowing}
                      >
                        <Heart
                          className={`h-4 w-4 mr-2 ${
                            collection.is_following ? 'fill-current' : ''
                          }`}
                        />
                        {collection.is_following ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div ref={ref} className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>
    </div>
  );
};
