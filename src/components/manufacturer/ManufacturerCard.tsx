import { Card, CardContent } from "@/components/ui/card";
import { ManufacturerHeader } from "./ManufacturerHeader";
import { ManufacturerRating } from "./ManufacturerRating";
import { PortfolioButton } from "./PortfolioButton";
import { ManufacturerReviews } from "./ManufacturerReviews";

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
  producedItems = [],
}: ManufacturerCardProps) => {
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

          <ManufacturerReviews reviews={reviews} />
        </div>
      </CardContent>
    </Card>
  );
};