import { useState } from "react";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ManufacturerReviewFormProps {
  manufacturerId: string;
  onReviewSubmitted?: () => void;
}

export const ManufacturerReviewForm = ({ 
  manufacturerId,
  onReviewSubmitted 
}: ManufacturerReviewFormProps) => {
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
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
            rating: newRating,
            comment,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      setNewRating(0);
      setComment("");
      onReviewSubmitted?.();
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
    <div className="border rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-medium">Write a Review</h4>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`w-5 h-5 cursor-pointer ${
              value <= newRating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
            }`}
            onClick={() => setNewRating(value)}
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
  );
};