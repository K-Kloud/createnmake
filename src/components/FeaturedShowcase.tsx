import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FeaturedShowcase = () => {
  const navigate = useNavigate();
  
  const { data: featuredImages, isLoading } = useQuery({
    queryKey: ['featured-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 showcase-section">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 showcase-section">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Featured Creations
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover amazing designs created by our community
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredImages?.map((image) => (
            <Card key={image.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                          U
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        Creator
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-white/80">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">0</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">0</span>
                        </div>
                      </div>
                      
                      {image.price && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          ${image.price}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/marketplace')}
          >
            View Full Marketplace
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};