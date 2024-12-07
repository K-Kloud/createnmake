import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}: ManufacturerCardProps) => {
  return (
    <Card className="glass-card hover:scale-[1.02] transition-transform">
      <CardHeader>
        <div className="flex items-center gap-4">
          <img
            src={image}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{type}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
            <span className="text-sm">({reviews.length} reviews)</span>
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
        </div>
      </CardContent>
    </Card>
  );
};