
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users } from "lucide-react";

export const SmartRecommendations = () => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: recommendations } = useQuery({
    queryKey: ['smart-recommendations', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      // Get user's creation history
      const { data: userImages } = await supabase
        .from('generated_images')
        .select('item_type, prompt, tags')
        .eq('user_id', session.user.id)
        .limit(10);

      // Get trending content
      const { data: trendingImages } = await supabase
        .from('generated_images')
        .select('item_type, prompt, tags, likes, views')
        .eq('is_public', true)
        .order('likes', { ascending: false })
        .limit(5);

      // Generate personalized recommendations
      const recommendations = [];

      // Based on user's favorite item types
      if (userImages && userImages.length > 0) {
        const itemTypeCounts = userImages.reduce((acc, img) => {
          acc[img.item_type] = (acc[img.item_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const favoriteType = Object.entries(itemTypeCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0];

        if (favoriteType) {
          recommendations.push({
            id: 'favorite-type',
            title: `More ${favoriteType} designs`,
            description: `Create more ${favoriteType} since you seem to love them!`,
            action: `Generate ${favoriteType}`,
            icon: Sparkles,
            type: 'personalized'
          });
        }
      }

      // Trending recommendations
      if (trendingImages && trendingImages.length > 0) {
        recommendations.push({
          id: 'trending',
          title: 'Trending Now',
          description: `${trendingImages[0].item_type} designs are popular today`,
          action: `Try ${trendingImages[0].item_type}`,
          icon: TrendingUp,
          type: 'trending'
        });
      }

      // Social recommendations
      recommendations.push({
        id: 'social',
        title: 'Join the Community',
        description: 'Share your creations and get inspired by others',
        action: 'Explore Marketplace',
        icon: Users,
        type: 'social'
      });

      return recommendations;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <rec.icon className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">{rec.title}</h4>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              {rec.action}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
