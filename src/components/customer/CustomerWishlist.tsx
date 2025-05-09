
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription, Card } from "@/components/ui/card";
import { ImageCard } from "@/components/gallery/ImageCard";

interface CustomerWishlistProps {
  customerId: string;
}

export const CustomerWishlist = ({ customerId }: CustomerWishlistProps) => {
  const [wishlistedItems, setWishlistedItems] = useState([]);
  
  // This would normally fetch actual wishlisted items from the database
  const { data: images, isLoading } = useQuery({
    queryKey: ['wishlist-items', customerId],
    queryFn: async () => {
      // For now, just returning an empty array
      // In a real implementation, this would query a wishlist table
      return [];
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!images?.length) {
    return (
      <Card className="p-8 text-center">
        <CardTitle className="mb-2">Your Wishlist is Empty</CardTitle>
        <CardDescription className="mb-6">
          Save designs you love to your wishlist for easy access later.
        </CardDescription>
        <Button onClick={() => window.location.href = '/marketplace'}>
          Browse Marketplace
        </Button>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map(image => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    </div>
  );
};
