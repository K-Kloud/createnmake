import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollectionRecommendations } from '@/hooks/useCollectionRecommendations';

export const RecommendedCollections = () => {
  const navigate = useNavigate();
  const { recommendations, isLoading } = useCollectionRecommendations();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Recommended For You</h2>
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

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Recommended For You</h2>
        <Badge variant="secondary" className="ml-2">
          Personalized
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((collection) => (
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
