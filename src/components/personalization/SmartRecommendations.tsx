import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, TrendingUp, Heart, Star } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Link } from "react-router-dom";

export const SmartRecommendations = () => {
  const { user } = useAuth();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["smart-recommendations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("smart_recommendations")
        .select(`
          *,
          generated_images:recommended_image_id (
            id,
            image_url,
            prompt,
            item_type,
            price,
            likes_count
          )
        `)
        .eq("user_id", user.id)
        .order("score", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "trending":
        return <TrendingUp className="h-4 w-4" aria-hidden="true" />;
      case "similar":
        return <Heart className="h-4 w-4" aria-hidden="true" />;
      case "personalized":
        return <Sparkles className="h-4 w-4" aria-hidden="true" />;
      case "new_arrival":
        return <Star className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Sparkles className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "trending":
        return "Trending Now";
      case "similar":
        return "Similar to Your Likes";
      case "personalized":
        return "Picked for You";
      case "new_arrival":
        return "New Arrival";
      default:
        return "Recommended";
    }
  };

  if (!user || isLoading) {
    return null;
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="recommendations-heading">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-acid-lime" aria-hidden="true" />
        <h2 id="recommendations-heading" className="text-xl font-mono uppercase tracking-widest text-ghost-white">
          RECOMMENDED_FOR_YOU
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Recommended products">
        {recommendations.map((rec) => {
          const image = rec.generated_images as any;
          if (!image) return null;

          return (
            <article
              key={rec.id}
              className="group border border-ghost-white/10 rounded-none overflow-hidden bg-void-black/50 hover:border-acid-lime/30 transition-colors"
              role="listitem"
            >
              <Link
                to={`/marketplace/${image.id}`}
                className="block"
                aria-label={`View ${image.item_type} - ${getTypeLabel(rec.recommendation_type)}`}
              >
                <div className="relative aspect-square overflow-hidden">
                  <OptimizedImage
                    src={image.image_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-mono uppercase tracking-wider bg-acid-lime/90 text-void-black">
                      {getRecommendationIcon(rec.recommendation_type)}
                      {getTypeLabel(rec.recommendation_type)}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    {image.item_type}
                  </p>
                  <p className="text-sm text-ghost-white line-clamp-2">{image.prompt}</p>
                  {image.price && (
                    <p className="text-lg font-semibold text-acid-lime">
                      ${image.price.toFixed(2)}
                    </p>
                  )}
                  {rec.reason && (
                    <p className="text-xs text-slate-500 italic">{rec.reason}</p>
                  )}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};
