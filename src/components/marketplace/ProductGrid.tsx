import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Eye, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProductItem {
  id: number;
  image_url: string;
  prompt: string;
  is_public: boolean;
  likes: number;
  views: number;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface ProductGridProps {
  searchQuery?: string;
  category?: string;
  sortBy?: 'recent' | 'popular' | 'trending';
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  searchQuery = '', 
  category = 'all',
  sortBy = 'recent' 
}) => {
  const [page, setPage] = useState(0);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);

  const { data: products, isLoading, isFetching } = useQuery({
    queryKey: ['marketplace-products', searchQuery, category, sortBy, page],
    queryFn: async () => {
      let query = supabase
        .from('generated_images')
        .select(`
          id,
          image_url,
          prompt,
          is_public,
          likes,
          views,
          created_at,
          user_id,
          profiles:profiles!inner(username, display_name, avatar_url)
        `)
        .eq('is_public', true)
        .range(page * 12, (page + 1) * 12 - 1);

      // Apply search filter
      if (searchQuery) {
        query = query.ilike('prompt', `%${searchQuery}%`);
      }

      // Apply category filter (basic categories based on prompt keywords)
      if (category !== 'all') {
        const categoryKeywords = {
          'tops': ['shirt', 'blouse', 'top', 'tunic', 'sweater'],
          'bottoms': ['pants', 'jeans', 'shorts', 'trousers', 'skirt'],
          'dresses': ['dress', 'gown', 'frock'],
          'outerwear': ['jacket', 'coat', 'blazer', 'hoodie'],
          'african': ['ankara', 'agbada', 'dashiki', 'aso oke', 'kente']
        };
        
        const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || [];
        if (keywords.length > 0) {
          const searchPattern = keywords.map(keyword => `%${keyword}%`).join('|');
          query = query.or(keywords.map(keyword => `prompt.ilike.%${keyword}%`).join(','));
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('likes', { ascending: false });
          break;
        case 'trending':
          query = query.order('views', { ascending: false });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as ProductItem[];
    },
  });

  // Infinite scroll setup
  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: () => {
      if (!isFetching && products && products.length === 12) {
        setPage(prev => prev + 1);
      }
    }
  });

  // Combine products from all pages
  React.useEffect(() => {
    if (products) {
      if (page === 0) {
        setAllProducts(products);
      } else {
        setAllProducts(prev => [...prev, ...products]);
      }
    }
  }, [products, page]);

  // Reset when filters change
  React.useEffect(() => {
    setPage(0);
    setAllProducts([]);
  }, [searchQuery, category, sortBy]);

  const handleLikeToggle = async (productId: number) => {
    try {
      const { data, error } = await supabase.rpc('atomic_like_image', {
        p_image_id: productId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      if (error) throw error;
      
      // Update local state
      setAllProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, likes: (data as any)?.new_count || product.likes }
            : product
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const incrementViews = async (productId: number) => {
    try {
      await supabase.rpc('increment_views', { image_id: productId });
      
      // Update local state
      setAllProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, views: product.views + 1 }
            : product
        )
      );
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  if (isLoading && page === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-t-lg" />
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16" />
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allProducts.map((product, index) => (
          <Card 
            key={product.id} 
            className="group overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.image_url}
                alt={product.prompt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onClick={() => incrementViews(product.id)}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleLikeToggle(product.id)}
                    className="gap-1"
                  >
                    <Heart className="w-4 h-4" />
                    {product.likes}
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1">
                    <ShoppingCart className="w-4 h-4" />
                    Order
                  </Button>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {product.prompt}
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span className="truncate">
                    {product.profiles?.display_name || product.profiles?.username || 'Anonymous'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {product.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {product.views}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {products && products.length === 12 && (
        <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
          {isFetching && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          )}
        </div>
      )}
    </div>
  );
};