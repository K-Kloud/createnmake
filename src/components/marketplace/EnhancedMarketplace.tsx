import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter,
  Grid,
  List,
  Heart,
  Eye,
  Download,
  Share2,
  TrendingUp,
  Clock,
  Star,
  Award,
  Users,
  Zap,
  Crown,
  Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GeneratedImage } from '@/types/content';
import { toast } from 'sonner';

interface MarketplaceImage extends GeneratedImage {
  user_profile?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    is_creator?: boolean;
    creator_tier?: string;
  };
  has_liked?: boolean;
  like_count?: number;
  view_count?: number;
  trending_score?: number;
}

interface MarketplaceFilters {
  category: 'all' | 'trending' | 'popular' | 'new' | 'featured';
  itemType: string;
  sortBy: 'recent' | 'likes' | 'views' | 'trending';
  timeFrame: '24h' | '7d' | '30d' | 'all';
  creatorTier: 'all' | 'pro' | 'enterprise';
}

const FEATURED_CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-red-500' },
  { id: 'popular', label: 'Popular', icon: Flame, color: 'text-orange-500' },
  { id: 'new', label: 'New', icon: Clock, color: 'text-blue-500' },
  { id: 'featured', label: 'Featured', icon: Star, color: 'text-yellow-500' },
];

export const EnhancedMarketplace = () => {
  const { session } = useAuth();
  const [images, setImages] = useState<MarketplaceImage[]>([]);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: 'trending',
    itemType: 'all',
    sortBy: 'trending',
    timeFrame: '7d',
    creatorTier: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [featuredCreators, setFeaturedCreators] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  useEffect(() => {
    loadMarketplaceData();
    loadFeaturedCreators();
    loadTrendingTags();
  }, [filters, currentPage]);

  const loadMarketplaceData = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('generated_images')
        .select(`
          *,
          profiles!generated_images_user_id_fkey(
            username, 
            display_name, 
            avatar_url, 
            is_creator, 
            creator_tier
          )
        `, { count: 'exact' })
        .eq('is_public', true);

      // Apply category filters
      switch (filters.category) {
        case 'trending':
          // Calculate trending score based on recent engagement
          const trendingCutoff = new Date();
          trendingCutoff.setDate(trendingCutoff.getDate() - 3);
          query = query.gte('created_at', trendingCutoff.toISOString());
          break;
        case 'popular':
          query = query.gte('likes', 5);
          break;
        case 'new':
          const newCutoff = new Date();
          newCutoff.setDate(newCutoff.getDate() - 1);
          query = query.gte('created_at', newCutoff.toISOString());
          break;
        case 'featured':
          // Featured items have high engagement and quality
          query = query.gte('likes', 10).gte('views', 100);
          break;
      }

      // Apply item type filter
      if (filters.itemType !== 'all') {
        query = query.eq('item_type', filters.itemType);
      }

      // Apply creator tier filter
      if (filters.creatorTier !== 'all') {
        // This would need a join with profiles table
      }

      // Apply time frame filter
      if (filters.timeFrame !== 'all') {
        const timeframeDays = {
          '24h': 1,
          '7d': 7,
          '30d': 30
        }[filters.timeFrame];
        
        if (timeframeDays) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);
          query = query.gte('created_at', cutoffDate.toISOString());
        }
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`prompt.ilike.%${searchTerm}%,item_type.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'likes':
          query = query.order('likes', { ascending: false });
          break;
        case 'views':
          query = query.order('views', { ascending: false });
          break;
        case 'trending':
          // Sort by a combination of recent activity and engagement
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Pagination
      const limit = 20;
      const from = (currentPage - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      // Process images and add computed fields
      const processedImages: MarketplaceImage[] = data?.map(item => ({
        ...item,
        user_profile: item.profiles ? {
          username: item.profiles.username,
          display_name: item.profiles.display_name,
          avatar_url: item.profiles.avatar_url,
          is_creator: item.profiles.is_creator,
          creator_tier: item.profiles.creator_tier
        } : undefined,
        like_count: item.likes || 0,
        view_count: item.views || 0,
        trending_score: calculateTrendingScore(item)
      })) || [];

      if (currentPage === 1) {
        setImages(processedImages);
      } else {
        setImages(prev => [...prev, ...processedImages]);
      }

      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast.error('Failed to load marketplace data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTrendingScore = (image: any): number => {
    const now = Date.now();
    const imageTime = new Date(image.created_at).getTime();
    const ageHours = (now - imageTime) / (1000 * 60 * 60);
    
    const likes = image.likes || 0;
    const views = image.views || 0;
    
    // Trending score: engagement rate with time decay
    const engagementScore = likes * 2 + views * 0.1;
    const timeDecay = Math.exp(-ageHours / 24); // Decay over 24 hours
    
    return engagementScore * timeDecay;
  };

  const loadFeaturedCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          is_creator,
          creator_tier
        `)
        .eq('is_creator', true)
        .limit(6);

      if (error) throw error;
      setFeaturedCreators(data || []);
    } catch (error) {
      console.error('Error loading featured creators:', error);
    }
  };

  const loadTrendingTags = async () => {
    try {
      // Extract trending tags from recent popular images
      const { data, error } = await supabase
        .from('generated_images')
        .select('item_type, prompt')
        .eq('is_public', true)
        .gte('likes', 3)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      if (error) throw error;

      if (data) {
        const tagCounts: Record<string, number> = {};
        data.forEach(image => {
          if (image.item_type) {
            tagCounts[image.item_type] = (tagCounts[image.item_type] || 0) + 1;
          }
        });

        const trending = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([tag]) => tag);

        setTrendingTags(trending);
      }
    } catch (error) {
      console.error('Error loading trending tags:', error);
    }
  };

  const handleLike = async (imageId: number) => {
    if (!session?.user) {
      toast.error('Please log in to like images');
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('atomic_like_image', {
          p_image_id: imageId,
          p_user_id: session.user.id
        });

      if (error) throw error;

      // Update local state
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, has_liked: (data as any)?.has_liked, like_count: (data as any)?.new_count }
          : img
      ));

      toast.success((data as any)?.action === 'liked' ? 'Image liked!' : 'Like removed');
    } catch (error) {
      console.error('Error liking image:', error);
      toast.error('Failed to like image');
    }
  };

  const handleViewImage = async (imageId: number) => {
    try {
      await supabase.rpc('increment_views', { image_id: imageId });
      
      // Update local view count
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, view_count: (img.view_count || 0) + 1 }
          : img
      ));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const getCreatorBadge = (tier?: string) => {
    switch (tier) {
      case 'pro':
        return <Badge className="bg-blue-500"><Crown className="h-3 w-3 mr-1" />Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-500"><Award className="h-3 w-3 mr-1" />Enterprise</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Marketplace</h2>
          <p className="text-muted-foreground">Discover amazing designs from our community</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs, styles, creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setCurrentPage(1)}>
              Search
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {FEATURED_CATEGORIES.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={filters.category === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, category: category.id as any }))}
                  className="flex items-center gap-1"
                >
                  <Icon className={`h-3 w-3 ${category.color}`} />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-500" />
              Trending Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setFilters(prev => ({ ...prev, itemType: tag }))}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Creators */}
      {featuredCreators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-500" />
              Featured Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCreators.map(creator => (
                <div key={creator.id} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                    {creator.avatar_url ? (
                      <img
                        src={creator.avatar_url}
                        alt={creator.display_name || creator.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate">
                      {creator.display_name || creator.username}
                    </p>
                    {getCreatorBadge(creator.creator_tier)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalCount} designs found
        </div>
      </div>

      {/* Images Grid/List */}
      {isLoading && currentPage === 1 ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-pulse text-muted-foreground">Loading marketplace...</div>
        </div>
      ) : images.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "space-y-3"
        }>
          {images.map((image) => (
            <Card 
              key={image.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleViewImage(image.id)}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(image.id);
                        }}
                      >
                        <Heart className={`h-4 w-4 ${image.has_liked ? 'fill-current' : ''}`} />
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {image.user_profile?.avatar_url ? (
                          <img
                            src={image.user_profile.avatar_url}
                            alt="Creator"
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted" />
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                          {image.user_profile?.display_name || image.user_profile?.username || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {image.like_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {image.view_count || 0}
                        </span>
                      </div>
                    </div>
                    {image.user_profile?.creator_tier && (
                      <div className="mt-2">
                        {getCreatorBadge(image.user_profile.creator_tier)}
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
                      className="w-20 h-20 object-cover rounded"
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
                              handleLike(image.id);
                            }}
                          >
                            <Heart className={`h-4 w-4 ${image.has_liked ? 'fill-current' : ''}`} />
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
                        {image.user_profile?.creator_tier && getCreatorBadge(image.user_profile.creator_tier)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {image.user_profile?.avatar_url ? (
                            <img
                              src={image.user_profile.avatar_url}
                              alt="Creator"
                              className="w-4 h-4 rounded-full"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-muted" />
                          )}
                          <span>{image.user_profile?.display_name || image.user_profile?.username || 'Anonymous'}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {image.like_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {image.view_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No designs found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search terms or browse different categories.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {images.length > 0 && currentPage * 20 < totalCount && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};