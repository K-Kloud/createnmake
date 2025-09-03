import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Bookmark,
  Grid,
  List,
  Eye,
  Share2,
  Download,
  Star,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GeneratedImage } from '@/types/content';
import { toast } from 'sonner';

interface FavoriteImage extends GeneratedImage {
  favorited_at?: string;
}

export const SimpleCollections = () => {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteImage[]>([]);
  const [myImages, setMyImages] = useState<GeneratedImage[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorites');

  useEffect(() => {
    if (session?.user) {
      loadUserImages();
      loadFavoriteImages();
    }
  }, [session]);

  const loadUserImages = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMyImages(data || []);
    } catch (error) {
      console.error('Error loading user images:', error);
      toast.error('Failed to load your images');
    }
  };

  const loadFavoriteImages = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      // Get liked images by joining with image_likes table
      const { data, error } = await supabase
        .from('image_likes')
        .select(`
          created_at,
          generated_images (*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const favoriteImages: FavoriteImage[] = data?.map(item => ({
        ...item.generated_images,
        favorited_at: item.created_at
      })).filter(Boolean) || [];

      setFavorites(favoriteImages);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorite images');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (imageId: number) => {
    if (!session?.user) {
      toast.error('Please log in to favorite images');
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('atomic_like_image', {
          p_image_id: imageId,
          p_user_id: session.user.id
        });

      if (error) throw error;

      if ((data as any)?.action === 'liked') {
        toast.success('Added to favorites!');
        // Reload favorites to get the new item
        loadFavoriteImages();
      } else {
        toast.success('Removed from favorites');
        setFavorites(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const incrementViews = async (imageId: number) => {
    try {
      await supabase.rpc('increment_views', { image_id: imageId });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const ImageCard = ({ image, isFavorite = false }: { image: GeneratedImage; isFavorite?: boolean }) => {
    const favoriteImage = image as FavoriteImage;
    
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow group">
        {viewMode === 'grid' ? (
          <>
            <div className="aspect-square overflow-hidden relative">
              <img
                src={image.image_url}
                alt={image.prompt}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onClick={() => incrementViews(image.id)}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(image.id);
                  }}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                </Button>
                <Button size="sm" variant="secondary">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-sm truncate mb-2">{image.prompt}</p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {image.item_type}
                </Badge>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {image.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {image.views || 0}
                  </span>
                </div>
              </div>
              {isFavorite && favoriteImage.favorited_at && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Bookmark className="h-3 w-3" />
                  Favorited {new Date(favoriteImage.favorited_at).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="p-4">
            <div className="flex gap-4">
              <img
                src={image.image_url}
                alt={image.prompt}
                className="w-16 h-16 object-cover rounded"
                onClick={() => incrementViews(image.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium truncate">{image.prompt}</h4>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(image.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{image.item_type}</Badge>
                  {image.is_public && <Badge variant="secondary" className="text-xs">Public</Badge>}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(image.created_at).toLocaleDateString()}</span>
                    {isFavorite && favoriteImage.favorited_at && (
                      <>
                        <Bookmark className="h-3 w-3" />
                        <span>Favorited {new Date(favoriteImage.favorited_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {image.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {image.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground text-center">
            Please sign in to view your collections and favorite images.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">My Collections</h2>
          <p className="text-muted-foreground">Your favorite images and creations</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favorites ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="myimages" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            My Creations ({myImages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="animate-pulse text-muted-foreground">Loading favorites...</div>
            </div>
          ) : favorites.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "space-y-3"
            }>
              {favorites.map((image) => (
                <ImageCard key={image.id} image={image} isFavorite={true} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground text-center">
                  Start exploring the marketplace and like images to add them to your favorites!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="myimages" className="space-y-4">
          {myImages.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "space-y-3"
            }>
              {myImages.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No creations yet</h3>
                <p className="text-muted-foreground text-center">
                  Start generating images to build your personal collection!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};