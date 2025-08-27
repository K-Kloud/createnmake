import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Filter, X } from "lucide-react";
import { ManufacturerCard } from "./ManufacturerCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SearchFilters {
  query: string;
  location: string;
  businessType: string[];
  specialties: string[];
  minRating: number;
  sortBy: 'rating' | 'reviews' | 'name' | 'location';
  sortOrder: 'asc' | 'desc';
}

export const ManufacturerSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    businessType: [],
    specialties: [],
    minRating: 0,
    sortBy: 'rating',
    sortOrder: 'desc'
  });
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Fetch manufacturers with search and filters
  const { data: manufacturers, isLoading } = useQuery({
    queryKey: ['manufacturers-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('manufacturers')
        .select(`
          *,
          manufacturer_reviews(rating),
          manufacturer_portfolios(id)
        `);

      // Apply text search
      if (filters.query) {
        query = query.or(`business_name.ilike.%${filters.query}%,business_type.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      // Apply location filter
      if (filters.location) {
        query = query.ilike('address', `%${filters.location}%`);
      }

      // Apply business type filter
      if (filters.businessType.length > 0) {
        query = query.in('business_type', filters.businessType);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching manufacturers:', error);
        return [];
      }

      // Process and filter the data
      const processedManufacturers = data?.map(manufacturer => {
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

      // Apply rating filter
      let filteredManufacturers = processedManufacturers.filter(m => m.avgRating >= filters.minRating);

      // Apply specialty filter
      if (filters.specialties.length > 0) {
        filteredManufacturers = filteredManufacturers.filter(m => 
          m.specialties?.some((specialty: string) => filters.specialties.includes(specialty))
        );
      }

      // Apply sorting
      filteredManufacturers.sort((a, b) => {
        let valueA: any, valueB: any;
        
        switch (filters.sortBy) {
          case 'rating':
            valueA = a.avgRating;
            valueB = b.avgRating;
            break;
          case 'reviews':
            valueA = a.reviewCount;
            valueB = b.reviewCount;
            break;
          case 'name':
            valueA = a.business_name?.toLowerCase() || '';
            valueB = b.business_name?.toLowerCase() || '';
            break;
          case 'location':
            valueA = a.address?.toLowerCase() || '';
            valueB = b.address?.toLowerCase() || '';
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });

      return filteredManufacturers;
    },
  });

  // Get unique business types and specialties for filters
  const { data: filterOptions } = useQuery({
    queryKey: ['manufacturer-filter-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('business_type, specialties');
      
      if (error) {
        console.error('Error fetching filter options:', error);
        return { businessTypes: [], specialties: [] };
      }

      const businessTypes = [...new Set(data?.map(m => m.business_type).filter(Boolean))];
      const specialties = [...new Set(data?.flatMap(m => m.specialties || []))];

      return { businessTypes, specialties };
    },
  });

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'businessType' | 'specialties', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      businessType: [],
      specialties: [],
      minRating: 0,
      sortBy: 'rating',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.query || filters.location || filters.businessType.length > 0 || 
    filters.specialties.length > 0 || filters.minRating > 0;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search manufacturers by name, type, or description..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {[
                      filters.businessType.length,
                      filters.specialties.length,
                      filters.minRating > 0 ? 1 : 0
                    ].reduce((sum, count) => sum + count, 0)}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="absolute top-full mt-2 right-0 z-10">
              <Card className="p-4 space-y-4 w-80">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Filters</h3>
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-muted-foreground"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label>Sort by</Label>
                  <div className="flex gap-2">
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="reviews">Reviews</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">↓</SelectItem>
                        <SelectItem value="asc">↑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <Label>Minimum Rating: {filters.minRating}/5</Label>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={(value) => updateFilter('minRating', value[0])}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Business Type Filter */}
                {filterOptions?.businessTypes && filterOptions.businessTypes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {filterOptions.businessTypes.map((type: string) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`business-${type}`}
                            checked={filters.businessType.includes(type)}
                            onCheckedChange={() => toggleArrayFilter('businessType', type)}
                          />
                          <label htmlFor={`business-${type}`} className="text-sm">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties Filter */}
                {filterOptions?.specialties && filterOptions.specialties.length > 0 && (
                  <div className="space-y-2">
                    <Label>Specialties</Label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {filterOptions.specialties.map((specialty: string) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={`specialty-${specialty}`}
                            checked={filters.specialties.includes(specialty)}
                            onCheckedChange={() => toggleArrayFilter('specialties', specialty)}
                          />
                          <label htmlFor={`specialty-${specialty}`} className="text-sm">
                            {specialty}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isLoading ? 'Searching...' : `${manufacturers?.length || 0} Manufacturers Found`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                <div className="h-20 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        ) : manufacturers && manufacturers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {manufacturers.map((manufacturer) => (
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
                verified={true} // You can add verification logic
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No manufacturers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear all filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};