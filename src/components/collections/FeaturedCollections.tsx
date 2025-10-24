import { usePublicCollections } from '@/hooks/usePublicCollections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Images } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FeaturedCollections = () => {
  const navigate = useNavigate();
  const { featuredCollections } = usePublicCollections();

  if (!featuredCollections || featuredCollections.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Featured Collections</h2>
            <p className="text-muted-foreground mt-1">
              Curated collections from our community
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCollections.map((collection) => (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg line-clamp-1">
                      {collection.name}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <Images className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              <CardContent className="pt-4">
                {collection.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {collection.description}
                  </p>
                )}

                {/* Tags */}
                {collection.tags && collection.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {collection.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {collection.follower_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <Images className="h-4 w-4" />
                    {collection.image_count}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
