import { Card, CardContent } from "@/components/ui/card";
import { ManufacturerHeader } from "./ManufacturerHeader";
import { ManufacturerRating } from "./ManufacturerRating";
import { PortfolioButton } from "./PortfolioButton";
import { ManufacturerReviews } from "./ManufacturerReviews";
import { useState } from "react";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ManufacturerCardProps {
  name: string;
  type: string;
  description: string;
  rating: number;
  reviews: Review[];
  image: string;
  location: string;
  specialties: string[];
  id: string;
  producedItems?: {
    id: number;
    generatedImage: string;
    productImage: string;
    description: string;
  }[];
}

export const ManufacturerCard = ({
  name,
  type,
  description,
  rating,
  reviews,
  image,
  location,
  specialties,
  id,
  producedItems = [],
}: ManufacturerCardProps) => {
  const [newRating, setNewRating] = useState(0);
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
        description: "Please sign in to submit a review",
        variant: "destructive",
      });
      return;
    }

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
            manufacturer_id: id,
            user_id: session.user.id,
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
    <Card className="glass-card hover:scale-[1.02] transition-transform">
      <ManufacturerHeader name={name} type={type} image={image} />
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <ManufacturerRating rating={rating} reviewCount={reviews.length} />
            <PortfolioButton name={name} producedItems={producedItems} />
          </div>
          
          <p className="text-sm">{description}</p>
          
          <div className="text-sm">
            <p className="text-muted-foreground">Location: {location}</p>
            <div className="mt-2">
              <p className="text-muted-foreground">Specialties:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {session && (
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
          )}

          <ManufacturerReviews reviews={reviews} manufacturerId={id} />
        </div>
      </CardContent>
    </Card>
  );
};