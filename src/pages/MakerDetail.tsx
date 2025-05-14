
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ManufacturerHeader } from "@/components/manufacturer/ManufacturerHeader";
import { ManufacturerCard } from "@/components/manufacturer/ManufacturerCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Manufacturer, Artisan } from "@/types/maker";
import { toast } from "@/components/ui/use-toast";

const MakerDetail = () => {
  const { makerId } = useParams<{ makerId: string }>();
  const [searchParams] = useSearchParams();
  const makerType = searchParams.get('type'); // 'manufacturer' or 'artisan'
  
  const { data: maker, isLoading } = useQuery({
    queryKey: ['maker', makerId, makerType],
    queryFn: async () => {
      if (!makerId) return null;
      
      const tableName = makerType === 'manufacturer' ? 'manufacturers' : 'profiles';
      const query = supabase
        .from(tableName)
        .select('*')
        .eq('id', makerId)
        .single();
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching maker details:', error);
        return null;
      }
      
      return data as Manufacturer | Artisan;
    },
    enabled: !!makerId && !!makerType,
  });
  
  const { data: portfolioItems } = useQuery({
    queryKey: ['portfolio', makerId],
    queryFn: async () => {
      if (!makerId) return [];
      
      const { data, error } = await supabase
        .from('manufacturer_portfolios')
        .select('*')
        .eq('manufacturer_id', makerId);
      
      if (error) {
        console.error('Error fetching portfolio:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        generatedImage: item.generatedimage,
        productImage: item.productimage,
        description: item.description
      }));
    },
    enabled: !!makerId && makerType === 'manufacturer',
  });
  
  const { data: reviews } = useQuery({
    queryKey: ['reviews', makerId, makerType],
    queryFn: async () => {
      if (!makerId || makerType !== 'manufacturer') return [];
      
      const { data, error } = await supabase
        .from('manufacturer_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles(username)
        `)
        .eq('manufacturer_id', makerId);
      
      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
      
      return data.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        date: new Date(review.created_at).toLocaleDateString(),
        // Fix: Access the first username from the profiles array or use a default value
        user: review.profiles && review.profiles[0]?.username || 'Anonymous'
      }));
    },
    enabled: !!makerId && makerType === 'manufacturer',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!maker) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Maker not found</h1>
          <p className="mt-4">The maker you are looking for does not exist or you don't have permission to view it.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (makerType === 'manufacturer') {
    // Type assertion to help TypeScript understand we're working with a Manufacturer
    const manufacturer = maker as Manufacturer;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="mb-8">
            <ManufacturerHeader 
              name={manufacturer.business_name} 
              type={manufacturer.business_type}
              image="/placeholder.svg" // Replace with actual image if available
            />
            <CardContent>
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">About {manufacturer.business_name}</h2>
                <p className="text-muted-foreground">
                  {manufacturer.business_type} based in {manufacturer.address || 'Location not specified'}
                </p>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {manufacturer.specialties?.map((specialty: string) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Contact</h3>
                  <p>Email: {manufacturer.contact_email}</p>
                  {manufacturer.phone && <p>Phone: {manufacturer.phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {portfolioItems && portfolioItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map(item => (
                  <div key={item.id} className="rounded-lg overflow-hidden border">
                    <div className="grid grid-cols-2 gap-2 p-2">
                      <img
                        src={item.generatedImage}
                        alt="Design"
                        className="w-full h-32 object-cover rounded"
                      />
                      <img
                        src={item.productImage}
                        alt="Product"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-center">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{review.user}</h3>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet.</p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Artisan view - Type assertion to help TypeScript understand we're working with an Artisan
  const artisan = maker as Artisan;
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{artisan.business_name || artisan.username}</h1>
        <p className="mb-6">Artisan Profile</p>
        
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            {artisan.avatar_url ? (
              <img src={artisan.avatar_url} alt="Profile" className="w-16 h-16 rounded-full mr-4" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <span className="text-xl font-bold">
                  {(artisan.business_name || artisan.username || "A").charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{artisan.business_name || artisan.username}</h2>
              <p className="text-muted-foreground">{artisan.business_type || "Artisan"}</p>
            </div>
          </div>
          
          {artisan.specialties && artisan.specialties.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {artisan.specialties.map((specialty: string) => (
                  <span
                    key={specialty}
                    className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {artisan.bio && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Bio</h3>
              <p>{artisan.bio}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MakerDetail;
