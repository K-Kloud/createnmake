import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Award, Clock, Package, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface SellerProfileProps {
  userId: string;
}

export const SellerProfile = ({ userId }: SellerProfileProps) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["seller-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["seller-reviews", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artisan_reviews")
        .select("rating")
        .eq("artisan_id", userId);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6" role="status" aria-label="Loading seller profile">
        <div className="h-32 bg-ghost-white/10 rounded-none"></div>
        <div className="h-20 bg-ghost-white/10 rounded-none"></div>
      </div>
    );
  }

  if (!profile) return null;

  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const getBadgeColor = (tier?: string | null) => {
    switch (tier) {
      case "platinum":
        return "text-cyan-400 border-cyan-400/30 bg-cyan-400/5";
      case "gold":
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/5";
      case "silver":
        return "text-slate-400 border-slate-400/30 bg-slate-400/5";
      default:
        return "text-amber-600 border-amber-600/30 bg-amber-600/5";
    }
  };

  return (
    <section className="space-y-6" aria-labelledby="seller-profile-heading">
      {/* Header */}
      <div className="border border-ghost-white/10 rounded-none p-6 bg-void-black/50">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-ghost-white/10 rounded-none border-2 border-acid-lime/20" aria-hidden="true" />
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h2 id="seller-profile-heading" className="text-2xl font-mono uppercase tracking-widest text-ghost-white">
                {profile.business_name || `Seller ${profile.user_id.slice(0, 8)}`}
              </h2>
              {profile.verified && (
                <ShieldCheck className="h-6 w-6 text-acid-lime" aria-label="Verified seller" />
              )}
              {profile.badge_tier && (
                <span
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border rounded-none ${getBadgeColor(
                    profile.badge_tier
                  )}`}
                  aria-label={`${profile.badge_tier} tier seller`}
                >
                  {profile.badge_tier}
                </span>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2" role="img" aria-label={`Average rating: ${avgRating.toFixed(1)} out of 5 stars`}>
                <Star className="h-5 w-5 fill-acid-lime text-acid-lime" aria-hidden="true" />
                <span className="font-semibold text-ghost-white">{avgRating.toFixed(1)}</span>
                <span className="text-slate-400">({reviews?.length || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span className="text-slate-400">
                  <span className="font-semibold text-ghost-white">{profile.total_sales}</span> sales
                </span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-ghost-white/10 rounded-none p-4 bg-void-black/50 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-mono uppercase tracking-wider">Response Time</span>
          </div>
          <p className="text-xl font-semibold text-ghost-white">
            {profile.avg_response_time_hours ? `${profile.avg_response_time_hours}h` : "N/A"}
          </p>
        </div>

        <div className="border border-ghost-white/10 rounded-none p-4 bg-void-black/50 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Award className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-mono uppercase tracking-wider">Response Rate</span>
          </div>
          <p className="text-xl font-semibold text-ghost-white">
            {profile.response_rate ? `${(profile.response_rate * 100).toFixed(0)}%` : "N/A"}
          </p>
        </div>

        <div className="border border-ghost-white/10 rounded-none p-4 bg-void-black/50 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Star className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-mono uppercase tracking-wider">Experience</span>
          </div>
          <p className="text-xl font-semibold text-ghost-white">
            {profile.years_experience ? `${profile.years_experience} years` : "N/A"}
          </p>
        </div>
      </div>

      {/* Specialties */}
      {profile.specialties && profile.specialties.length > 0 && (
        <div className="border border-ghost-white/10 rounded-none p-6 bg-void-black/50">
          <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-4">
            SPECIALTIES
          </h3>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Seller specialties">
            {profile.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-mono uppercase tracking-wider border border-acid-lime/20 text-acid-lime bg-acid-lime/5 rounded-none"
                role="listitem"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-4">
        <Button
          className="flex-1 bg-acid-lime text-void-black hover:bg-acid-lime/90"
          aria-label="Contact seller"
        >
          Contact Seller
        </Button>
        <Button
          variant="outline"
          className="border-ghost-white/20 hover:bg-ghost-white/5"
          aria-label="View seller's shop"
        >
          View Shop
        </Button>
      </div>
    </section>
  );
};
