
import { Card, CardContent } from "@/components/ui/card";
import { ManufacturerRating } from "./ManufacturerRating";
import { PortfolioButton } from "./PortfolioButton";
import { ManufacturerReviews } from "./ManufacturerReviews";
import { ManufacturerReviewForm } from "./ManufacturerReviewForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ManufacturerCardProps {
  id: string;
  name: string;
  type: string;
  image?: string;
  description: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  specialties: string[];
  producedItems?: {
    id: number;
    generatedImage: string;
    productImage: string;
    description: string;
  }[];
}

export const ManufacturerCard = ({
  id,
  name,
  type,
  image,
  description,
  rating,
  reviewCount,
  reviews,
  specialties,
  producedItems = [],
}: ManufacturerCardProps) => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  
  const isMobile = useIsMobile();

  return (
    <Card className="glass-card hover:scale-[1.02] transition-transform">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-semibold">{name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{type}</p>
            </div>
            {image && (
              <img
                src={image}
                alt={name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
              />
            )}
          </div>

          <ManufacturerRating rating={rating} reviewCount={reviewCount} />

          <p className="text-xs sm:text-sm">{description}</p>

          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 rounded-full text-xs"
              >
                {specialty}
              </span>
            ))}
          </div>

          {producedItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm sm:text-base">Recent Work</h4>
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {producedItems.map((item, index) => (
                  <img
                    key={index}
                    src={item.productImage}
                    alt={item.description}
                    className="w-full h-16 sm:h-24 object-cover rounded-md"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          <PortfolioButton name={name} producedItems={producedItems} />

          {session && (
            <ManufacturerReviewForm 
              manufacturerId={id}
              onReviewSubmitted={() => {
                // Optionally trigger a refetch of reviews
              }}
            />
          )}

          <ManufacturerReviews reviews={reviews} manufacturerId={id} />
        </div>
      </CardContent>
    </Card>
  );
};
