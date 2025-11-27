import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, ThumbsUp, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductReviewsProps {
  imageId: number;
}

export const ProductReviews = ({ imageId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Fetch reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["product-reviews", imageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("image_id", imageId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async (reviewData: any) => {
      const { error } = await supabase.from("product_reviews").insert(reviewData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", imageId] });
      toast({ title: "Review submitted successfully" });
      setRating(0);
      setTitle("");
      setReviewText("");
      setShowForm(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to submit review",
      });
    },
  });

  // Vote helpful mutation
  const voteHelpful = useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) => {
      const { error } = await supabase.from("review_votes").upsert({
        review_id: reviewId,
        user_id: user?.id,
        is_helpful: isHelpful,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", imageId] });
    },
  });

  const handleSubmit = () => {
    if (!user) {
      toast({ title: "Please sign in to leave a review" });
      return;
    }
    if (rating === 0 || !reviewText) {
      toast({ title: "Please provide a rating and review text" });
      return;
    }

    submitReview.mutate({
      image_id: imageId,
      user_id: user.id,
      rating,
      title,
      review_text: reviewText,
    });
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1" role="group" aria-label={`Rating: ${count} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= count ? "fill-acid-lime text-acid-lime" : "text-slate-600"
            } ${interactive ? "cursor-pointer hover:text-acid-lime" : ""}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setRating(star);
                    }
                  }
                : undefined
            }
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse" role="status" aria-label="Loading reviews">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-ghost-white/10 rounded-none p-4 bg-void-black/50">
            <div className="h-4 bg-ghost-white/10 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-ghost-white/10 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="space-y-6" aria-labelledby="reviews-heading">
      <div className="flex items-center justify-between">
        <div>
          <h3 id="reviews-heading" className="text-lg font-mono uppercase tracking-widest text-ghost-white">
            CUSTOMER_REVIEWS
          </h3>
          <div className="flex items-center gap-3 mt-2">
            {renderStars(Math.round(avgRating))}
            <span className="text-sm text-slate-400" aria-label={`Average rating: ${avgRating.toFixed(1)} out of 5`}>
              {avgRating.toFixed(1)} ({reviews?.length || 0} reviews)
            </span>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="outline"
          className="border-acid-lime/20 text-acid-lime hover:bg-acid-lime/10"
          aria-expanded={showForm}
          aria-controls="review-form"
        >
          Write Review
        </Button>
      </div>

      {showForm && (
        <form
          id="review-form"
          className="border border-ghost-white/10 rounded-none p-6 bg-void-black/50 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          aria-label="Review submission form"
        >
          <div>
            <label className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-2 block">
              Rating <span aria-label="required">*</span>
            </label>
            {renderStars(rating, true)}
          </div>
          <div>
            <label htmlFor="review-title" className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-2 block">
              Title
            </label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              className="bg-void-black border-ghost-white/10"
              aria-describedby="title-help"
            />
            <span id="title-help" className="sr-only">
              Optional title for your review
            </span>
          </div>
          <div>
            <label htmlFor="review-text" className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-2 block">
              Review <span aria-label="required">*</span>
            </label>
            <Textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this product"
              className="bg-void-black border-ghost-white/10 min-h-[120px]"
              required
              aria-required="true"
            />
          </div>
          <Button
            type="submit"
            disabled={submitReview.isPending}
            className="bg-acid-lime text-void-black hover:bg-acid-lime/90"
            aria-busy={submitReview.isPending}
          >
            {submitReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      <div className="space-y-4" role="list" aria-label="Customer reviews">
        {reviews?.map((review) => (
          <article
            key={review.id}
            className="border border-ghost-white/10 rounded-none p-6 bg-void-black/50 space-y-3"
            role="listitem"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ghost-white/10" aria-hidden="true" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ghost-white">
                      User #{review.user_id.slice(0, 8)}
                    </p>
                    {review.verified_purchase && (
                      <ShieldCheck className="h-4 w-4 text-acid-lime" aria-label="Verified purchase" />
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
              </div>
              <time className="text-xs text-slate-500 font-mono" dateTime={review.created_at}>
                {new Date(review.created_at).toLocaleDateString()}
              </time>
            </div>
            {review.title && <h4 className="font-semibold text-ghost-white">{review.title}</h4>}
            <p className="text-slate-300 leading-relaxed">{review.review_text}</p>
            <div className="flex items-center gap-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => voteHelpful.mutate({ reviewId: review.id, isHelpful: true })}
                className="text-slate-400 hover:text-acid-lime gap-2"
                disabled={!user}
                aria-label={`Mark review as helpful. ${review.helpful_count} people found this helpful.`}
              >
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                Helpful ({review.helpful_count})
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
