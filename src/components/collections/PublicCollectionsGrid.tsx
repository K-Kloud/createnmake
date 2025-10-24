import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { usePublicCollections } from '@/hooks/usePublicCollections';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Images, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export const PublicCollectionsGrid = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { ref, inView } = useInView();

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  const {
    collections,
    isLoading,
    fetchNextPage,
    hasNextPage,
    followCollection,
    unfollowCollection,
    isFollowing,
    isUnfollowing,
  } = usePublicCollections(userId || undefined);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted" />
            <CardHeader>
              <div className="h-6 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Card
            key={collection.id}
            className="group hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/collections/${collection.id}`)}
          >
            {/* Cover Image */}
            {collection.cover_image_url ? (
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img
                  src={collection.cover_image_url}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-sm flex items-center gap-1">
                  <Images className="h-3 w-3" />
                  {collection.image_count}
                </div>
              </div>
            ) : (
              <div className="h-48 bg-muted flex items-center justify-center">
                <Images className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1">{collection.name}</CardTitle>
                  {collection.description && (
                    <CardDescription className="line-clamp-2 mt-1">
                      {collection.description}
                    </CardDescription>
                  )}
                </div>
              </div>

              {/* Tags */}
              {collection.tags && collection.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {collection.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {collection.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{collection.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>

            <CardFooter className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {collection.follower_count}
                </div>
                <div className="flex items-center gap-1">
                  <Images className="h-4 w-4" />
                  {collection.image_count}
                </div>
              </div>

              {userId && (
                <Button
                  size="sm"
                  variant={collection.is_following ? 'default' : 'outline'}
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
                  {collection.is_following ? 'Following' : 'Follow'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
    </div>
  );
};
