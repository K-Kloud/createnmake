import { Star } from "lucide-react";

interface ManufacturerRatingProps {
  rating: number;
  reviewCount: number;
}

export const ManufacturerRating = ({ rating, reviewCount }: ManufacturerRatingProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm">({reviewCount} reviews)</span>
      </div>
    </div>
  );
};