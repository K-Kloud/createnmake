import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, Users, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollectionAnalytics } from '@/hooks/useCollectionAnalytics';

export const TrendingCollections = () => {
  const navigate = useNavigate();
  const { trendingCollections, isLoadingTrending } = useCollectionAnalytics();

  if (isLoadingTrending) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Trending Collections</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

  if (trendingCollections.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Trending Collections</h2>
        <Badge variant="secondary" className="ml-2">
          Hot
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingCollections.slice(0, 6).map((collection, index) => (
          <Card
            key={collection.collection_id}
            className="cursor-pointer hover:shadow-lg transition-shadow group"
            onClick={() => navigate(`/collections/${collection.collection_id}`)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                {collection.cover_image_url ? (
                  <img
                    src={collection.cover_image_url}
                    alt={collection.collection_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-2 left-2">
                  #{index + 1}
                </Badge>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {collection.collection_name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {collection.view_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {collection.follower_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {collection.image_count}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
