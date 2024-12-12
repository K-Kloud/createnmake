import { Star } from "lucide-react";

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ManufacturerReviewsProps {
  reviews: Review[];
}

export const ManufacturerReviews = ({ reviews }: ManufacturerReviewsProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-medium">Recent Reviews</h4>
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