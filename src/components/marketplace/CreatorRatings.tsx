
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

interface Review {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface CreatorRatingsProps {
  creatorId: string;
}

export const CreatorRatings = ({ creatorId }: CreatorRatingsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sample reviews
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      userId: "user1",
      userName: "Jane Cooper",
      userAvatar: "https://github.com/shadcn.png",
      rating: 5,
      comment: "Amazing designs! The quality is outstanding and the creativity is unmatched.",
      date: "2 weeks ago"
    },
    {
      id: 2,
      userId: "user2",
      userName: "Alex Chen",
      userAvatar: "https://github.com/shadcn.png",
      rating: 4,
      comment: "Great work overall. The designs are beautiful and well-executed.",
      date: "1 month ago"
    },
    {
      id: 3,
      userId: "user3",
      userName: "Marcus Brown",
      userAvatar: "https://github.com/shadcn.png",
      rating: 5,
      comment: "Exceptional talent! I've purchased multiple designs and they're all fantastic.",
      date: "2 months ago"
    }
  ]);

  const handleRatingSubmit = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to leave a review.",
        variant: "destructive"
      });
      return;
    }
    
    if (userRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newReview: Review = {
        id: reviews.length + 1,
        userId: user.id,
        userName: user.email?.split('@')[0] || 'Anonymous',
        userAvatar: "https://github.com/shadcn.png",
        rating: userRating,
        comment: comment.trim(),
        date: "Just now"
      };
      
      setReviews([newReview, ...reviews]);
      setUserRating(0);
      setComment("");
      setIsSubmitting(false);
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!"
      });
    }, 1000);
  };
  
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
        <div className="flex-grow">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon 
                key={star}
                className={`w-5 h-5 ${star <= averageRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Leave a review</h3>
        <div className="flex mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`w-6 h-6 cursor-pointer ${
                star <= (hoverRating || userRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setUserRating(star)}
            />
          ))}
          <span className="ml-2 text-sm">
            {userRating > 0 ? `${userRating} star${userRating > 1 ? 's' : ''}` : 'Select rating'}
          </span>
        </div>
        
        <Textarea
          placeholder="Share your thoughts about this creator's work..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mb-2"
        />
        
        <Button 
          onClick={handleRatingSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={review.userAvatar} alt={review.userName} />
                  <AvatarFallback>{review.userName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{review.userName}</div>
                  <div className="text-xs text-muted-foreground">{review.date}</div>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
