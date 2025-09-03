import React, { useState, useEffect, useMemo } from 'react';
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
  SlidersHorizontal,
  Calendar,
  Tag,
  User,
  Heart,
  Eye,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GeneratedImage } from '@/types/content';
import { toast } from 'sonner';

interface SearchFilters {
  query: string;
  itemTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: 'recent' | 'popular' | 'trending' | 'likes' | 'views';
  minLikes: number;
  minViews: number;
  isPublic?: boolean;
  userId?: string;
}

interface SearchResult extends GeneratedImage {
  user_profile?: {
    username?: string;
    display_name?: string;
  };
}

const ITEM_TYPES = [
  'T-Shirt', 'Dress', 'Jacket', 'Pants', 'Accessories', 'Shoes',
  'Blouse', 'Sweater', 'Skirt', 'Coat', 'Hat', 'Jewelry'
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent', icon: Calendar },
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  { value: 'trending', label: 'Trending', icon: Sparkles },
  { value: 'likes', label: 'Most Liked', icon: Heart },
  { value: 'views', label: 'Most Viewed', icon: Eye },
];

export const AdvancedSearch = () => {
  const { session } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    itemTypes: [],
    dateRange: { start: '', end: '' },
    sortBy: 'recent',
    minLikes: 0,
    minViews: 0,
    isPublic: true
  });
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const searchImages = async (page = 1) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('generated_images')
        .select(`
          *,
          profiles!generated_images_user_id_fkey(username, display_name)
        `, { count: 'exact' });

      // Apply text search
      if (filters.query) {
        query = query.or(`prompt.ilike.%${filters.query}%,item_type.ilike.%${filters.query}%`);
      }

      // Apply item type filters
      if (filters.itemTypes.length > 0) {
        query = query.in('item_type', filters.itemTypes);
      }

      // Apply date range
      if (filters.dateRange.start) {
        query = query.gte('created_at', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        query = query.lte('created_at', filters.dateRange.end);
      }

      // Apply metrics filters
      if (filters.minLikes > 0) {
        query = query.gte('likes', filters.minLikes);
      }
      if (filters.minViews > 0) {
        query = query.gte('views', filters.minViews);
      }

      // Apply public filter
      if (filters.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic);
      }

      // Apply user filter
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
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
        case 'popular':
          query = query.order('likes', { ascending: false });
          break;
        case 'trending':
          // Simple trending algorithm: recent + popular
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Pagination
      const limit = 20;
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const formattedResults: SearchResult[] = data?.map(item => ({
        ...item,
        user_profile: item.profiles ? {
          username: item.profiles.username,
          display_name: item.profiles.display_name
        } : undefined
      })) || [];

      if (page === 1) {
        setResults(formattedResults);
        setTotalCount(count || 0);
      } else {
        setResults(prev => [...prev, ...formattedResults]);
      }

      setCurrentPage(page);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    searchImages(1);
  };

  const loadMore = () => {
    if (!isLoading && currentPage * 20 < totalCount) {
      searchImages(currentPage + 1);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleItemType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      itemTypes: prev.itemTypes.includes(type)
        ? prev.itemTypes.filter(t => t !== type)
        : [...prev.itemTypes, type]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      itemTypes: [],
      dateRange: { start: '', end: '' },
      sortBy: 'recent',
      minLikes: 0,
      minViews: 0,
      isPublic: true
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.itemTypes.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.minLikes > 0) count++;
    if (filters.minViews > 0) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Advanced Search</h2>
          <p className="text-muted-foreground">Discover images with powerful search and filtering</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by prompt, style, or clothing type..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Item Types */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Item Types</label>
                  <div className="flex flex-wrap gap-1">
                    {ITEM_TYPES.map(type => (
                      <Badge
                        key={type}
                        variant={filters.itemTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleItemType(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                      className="text-xs"
                    />
                    <Input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Engagement</label>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Min Likes</label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minLikes}
                        onChange={(e) => updateFilter('minLikes', parseInt(e.target.value) || 0)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Min Views</label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minViews}
                        onChange={(e) => updateFilter('minViews', parseInt(e.target.value) || 0)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <div className="space-y-1">
                    {SORT_OPTIONS.map(option => (
                      <label key={option.value} className="flex items-center space-x-2 text-xs">
                        <input
                          type="radio"
                          name="sortBy"
                          value={option.value}
                          checked={filters.sortBy === option.value}
                          onChange={(e) => updateFilter('sortBy', e.target.value)}
                          className="text-xs"
                        />
                        <option.icon className="h-3 w-3" />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button size="sm" onClick={handleSearch}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalCount} images found
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
      )}

      {results.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "space-y-3"
        }>
          {results.map((image) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {viewMode === 'grid' ? (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <CardContent className="p-3">
                    <p className="text-sm truncate mb-2">{image.prompt}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {image.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {image.views || 0}
                      </span>
                    </div>
                  </CardContent>
                </div>
              ) : (
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{image.prompt}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {image.item_type}
                        </Badge>
                        {image.user_profile?.username && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {image.user_profile.display_name || image.user_profile.username}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {image.likes || 0} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {image.views || 0} views
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {results.length > 0 && currentPage * 20 < totalCount && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {hasSearched && results.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No images found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};