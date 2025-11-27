import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FeaturedArtisan {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  total_reviews: number;
  avg_rating: number;
  total_orders: number;
  portfolio_count: number;
}

export const FeaturedArtisans = () => {
  const navigate = useNavigate();

  const { data: artisans, isLoading } = useQuery({
    queryKey: ['featured-artisans'],
    queryFn: async () => {
      // Get artisans with reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('artisan_reviews')
        .select('artisan_id, rating');

      if (reviewsError) throw reviewsError;

      // Calculate average ratings and counts
      const artisanStats = reviews?.reduce((acc, review) => {
        if (!acc[review.artisan_id]) {
          acc[review.artisan_id] = { total: 0, count: 0, sum: 0 };
        }
        acc[review.artisan_id].sum += review.rating;
        acc[review.artisan_id].count += 1;
        acc[review.artisan_id].total = acc[review.artisan_id].sum / acc[review.artisan_id].count;
        return acc;
      }, {} as Record<string, { total: number; count: number; sum: number }>);

      // Get top artisans
      const topArtisanIds = Object.entries(artisanStats || {})
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 6)
        .map(([id]) => id);

      if (!topArtisanIds.length) return [];

      // Get artisan profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .in('id', topArtisanIds);

      if (profilesError) throw profilesError;

      // Get portfolio counts
      const { data: portfolios, error: portfolioError } = await supabase
        .from('artisan_portfolio')
        .select('artisan_id, id')
        .in('artisan_id', topArtisanIds);

      if (portfolioError) throw portfolioError;

      const portfolioCounts = portfolios?.reduce((acc, item) => {
        acc[item.artisan_id] = (acc[item.artisan_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get order counts
      const { data: orders, error: ordersError } = await supabase
        .from('artisan_quotes')
        .select('artisan_id, id')
        .in('artisan_id', topArtisanIds)
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      const orderCounts = orders?.reduce((acc, item) => {
        if (item.artisan_id) {
          acc[item.artisan_id] = (acc[item.artisan_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Combine data
      return profiles?.map(profile => ({
        id: profile.id,
        username: profile.username || 'Artisan',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || 'Skilled artisan creating quality products',
        total_reviews: artisanStats?.[profile.id]?.count || 0,
        avg_rating: artisanStats?.[profile.id]?.total || 0,
        total_orders: orderCounts?.[profile.id] || 0,
        portfolio_count: portfolioCounts?.[profile.id] || 0
      })) as FeaturedArtisan[] || [];
    }
  });

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-[hsl(var(--acid-lime))]" />
          <h2 className="text-2xl font-bold font-mono uppercase tracking-wider">
            Featured Artisans
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!artisans?.length) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-[hsl(var(--acid-lime))]" />
        <h2 className="text-2xl font-bold font-mono uppercase tracking-wider">
          Featured Artisans
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artisans.map((artisan, index) => (
          <Card
            key={artisan.id}
            className={cn(
              "group cursor-pointer hover:border-[hsl(var(--acid-lime))]/50 transition-all hover:shadow-lg",
              index === 0 && "border-[hsl(var(--acid-lime))]/30"
            )}
            onClick={() => navigate(`/maker/${artisan.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16 border-2 border-[hsl(var(--acid-lime))]/20">
                  <AvatarImage src={artisan.avatar_url} alt={artisan.username} />
                  <AvatarFallback className="bg-[hsl(var(--acid-lime))]/10 text-[hsl(var(--acid-lime))]">
                    {artisan.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{artisan.username}</h3>
                    {index === 0 && (
                      <Award className="w-4 h-4 text-[hsl(var(--acid-lime))]" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-[hsl(var(--acid-lime))] text-[hsl(var(--acid-lime))]" />
                    <span className="text-sm font-mono">
                      {artisan.avg_rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ({artisan.total_reviews})
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {artisan.bio}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">
                    {artisan.total_orders} orders
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {artisan.portfolio_count} items
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
