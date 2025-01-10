import { Star } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ManufacturerReviewsProps {
  reviews: Review[];
  manufacturerId: string;
}

export const ManufacturerReviews = ({ reviews, manufacturerId }: ManufacturerReviewsProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleSubmitReview = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('manufacturer_reviews')
        .insert([
          {
            manufacturer_id: manufacturerId,
            user_id: session.user.id,
            rating,
            comment,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      setRating(0);
      setComment("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Recent Reviews</h4>
      {session && (
        <div className="border rounded-lg p-4 space-y-3">
          <h5 className="text-sm font-medium">Write a Review</h5>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={`w-5 h-5 cursor-pointer ${
                  value <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                }`}
                onClick={() => setRating(value)}
              />
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleSubmitReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}
      {reviews.slice(0, 2).map((review) => (
        <div key={review.id} className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{review.user}</span>
            <span className="text-sm text-muted-foreground">{review.date}</span>
          </div>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm mt-1">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};