import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Star, TrendingUp } from "lucide-react";
import { ManufacturerSearch } from "./ManufacturerSearch";
import { ManufacturerCard } from "./ManufacturerCard";

export const ManufacturerDirectory = () => {
  const [activeTab, setActiveTab] = useState("search");

  // Featured manufacturers query
  const { data: featuredManufacturers, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select(`
          *,
          manufacturer_reviews(rating),
          manufacturer_portfolios(id)
        `)
        .limit(6);

      if (error) {
        console.error('Error fetching featured manufacturers:', error);
        return [];
      }

      return data?.map(manufacturer => {
        const reviews = manufacturer.manufacturer_reviews || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
          : 0;
        
        return {
          ...manufacturer,
          avgRating,
          reviewCount: reviews.length,
          portfolioCount: manufacturer.manufacturer_portfolios?.length || 0,
        };
      }).sort((a, b) => b.avgRating - a.avgRating) || [];
    },
  });

  // Recent manufacturers query
  const { data: recentManufacturers, isLoading: loadingRecent } = useQuery({
    queryKey: ['recent-manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select(`
          *,
          manufacturer_reviews(rating),
          manufacturer_portfolios(id)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching recent manufacturers:', error);
        return [];
      }

      return data?.map(manufacturer => {
        const reviews = manufacturer.manufacturer_reviews || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
          : 0;
        
        return {
          ...manufacturer,
          avgRating,
          reviewCount: reviews.length,
          portfolioCount: manufacturer.manufacturer_portfolios?.length || 0,
        };
      }) || [];
    },
  });

  // Categories query
  const { data: categories } = useQuery({
    queryKey: ['manufacturer-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('business_type')
        .not('business_type', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      const categoryCount = data?.reduce((acc: Record<string, number>, manufacturer) => {
        const type = manufacturer.business_type;
        if (type) {
          acc[type] = (acc[type] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      return Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Manufacturer Directory</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover skilled manufacturers and bring your designs to life with our trusted network of craftspeople.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="recent">New</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <ManufacturerSearch />
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Featured Manufacturers
            </h2>
            <p className="text-muted-foreground">Top-rated manufacturers with excellent reviews</p>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredManufacturers?.map((manufacturer) => (
                <ManufacturerCard
                  key={manufacturer.id}
                  id={manufacturer.id}
                  name={manufacturer.business_name || 'Unnamed Business'}
                  type={manufacturer.business_type || 'General'}
                  description={manufacturer.description || 'No description available'}
                  location={manufacturer.address}
                  rating={manufacturer.avgRating}
                  reviewCount={manufacturer.reviewCount}
                  portfolioCount={manufacturer.portfolioCount}
                  specialties={manufacturer.specialties || []}
                  verified={true}
                  phone={manufacturer.phone}
                  email={manufacturer.contact_email}
                  website={manufacturer.website}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              New Manufacturers
            </h2>
            <p className="text-muted-foreground">Recently joined manufacturers ready to work</p>
          </div>

          {loadingRecent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentManufacturers?.map((manufacturer) => (
                <ManufacturerCard
                  key={manufacturer.id}
                  id={manufacturer.id}
                  name={manufacturer.business_name || 'Unnamed Business'}
                  type={manufacturer.business_type || 'General'}
                  description={manufacturer.description || 'No description available'}
                  location={manufacturer.address}
                  rating={manufacturer.avgRating}
                  reviewCount={manufacturer.reviewCount}
                  portfolioCount={manufacturer.portfolioCount}
                  specialties={manufacturer.specialties || []}
                  verified={true}
                  phone={manufacturer.phone}
                  email={manufacturer.contact_email}
                  website={manufacturer.website}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Browse by Category
            </h2>
            <p className="text-muted-foreground">Find manufacturers by their specialization</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories?.map((category) => (
              <Card key={category.name} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">{category.name}</h3>
                  <Badge variant="secondary">{category.count} manufacturers</Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => {
                      setActiveTab('search');
                      // TODO: Set search filters for this category
                    }}
                  >
                    Browse {category.name}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};