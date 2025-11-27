import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessStory {
  id: string;
  artisan_name: string;
  artisan_avatar: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  order_value?: number;
}

export const SuccessStories = () => {
  const { data: stories, isLoading } = useQuery({
    queryKey: ['success-stories'],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from('artisan_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          order_id,
          artisan_id,
          user_id
        `)
        .gte('rating', 4)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (!reviews?.length) return [];

      // Get artisan profiles
      const artisanIds = [...new Set(reviews.map(r => r.artisan_id))];
      const { data: artisans } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', artisanIds);

      // Get customer profiles
      const userIds = [...new Set(reviews.map(r => r.user_id))];
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      const artisanMap = new Map(artisans?.map(a => [a.id, a]));
      const userMap = new Map(users?.map(u => [u.id, u]));

      return reviews.map(review => {
        const artisan = artisanMap.get(review.artisan_id);
        const user = userMap.get(review.user_id);

        return {
          id: review.id,
          artisan_name: artisan?.username || 'Artisan',
          artisan_avatar: artisan?.avatar_url || '',
          customer_name: user?.username || 'Customer',
          rating: review.rating,
          comment: review.comment || '',
          created_at: review.created_at
        };
      }) as SuccessStory[];
    }
  });

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Quote className="w-5 h-5 text-[hsl(var(--acid-lime))]" />
          <h2 className="text-2xl font-bold font-mono uppercase tracking-wider">
            Success Stories
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stories?.length) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <Quote className="w-5 h-5 text-[hsl(var(--acid-lime))]" />
        <h2 className="text-2xl font-bold font-mono uppercase tracking-wider">
          Success Stories
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stories.map((story) => (
          <Card
            key={story.id}
            className="group hover:border-[hsl(var(--acid-lime))]/50 transition-all hover:shadow-lg"
          >
            <CardContent className="p-6">
              <Quote className="w-8 h-8 text-[hsl(var(--acid-lime))]/20 mb-4" />
              
              <p className="text-sm mb-4 line-clamp-4 italic">
                "{story.comment}"
              </p>
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < story.rating
                        ? "fill-[hsl(var(--acid-lime))] text-[hsl(var(--acid-lime))]"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-10 h-10 border border-[hsl(var(--acid-lime))]/20">
                    <AvatarImage src={story.artisan_avatar} alt={story.artisan_name} />
                    <AvatarFallback className="bg-[hsl(var(--acid-lime))]/10 text-[hsl(var(--acid-lime))]">
                      {story.artisan_name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{story.artisan_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Artisan
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer: <span className="font-mono">{story.customer_name}</span>
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  {new Date(story.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
