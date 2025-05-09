
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Sheet, 
  SheetClose, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface MarketplaceHeaderProps {
  onSearch: (term: string) => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStyleChange?: (value: string) => void;
  onCreatorChange?: (value: string) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
}

export const MarketplaceHeader = ({ 
  onSearch, 
  onSortChange, 
  onCategoryChange,
  onStyleChange,
  onCreatorChange,
  onPriceRangeChange
}: MarketplaceHeaderProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [openFilters, setOpenFilters] = useState(false);
  
  // Use URL parameters for better SEO and user experience
  useEffect(() => {
    const searchTerm = searchParams.get('q');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    const style = searchParams.get('style');
    const creator = searchParams.get('creator');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    if (searchTerm) onSearch(searchTerm);
    if (category) onCategoryChange(category);
    if (sort) onSortChange(sort);
    if (style && onStyleChange) onStyleChange(style);
    if (creator && onCreatorChange) onCreatorChange(creator);
    if (minPrice && maxPrice && onPriceRangeChange) {
      onPriceRangeChange([parseInt(minPrice), parseInt(maxPrice)]);
      setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    }
  }, [searchParams, onSearch, onCategoryChange, onSortChange, onStyleChange, onCreatorChange, onPriceRangeChange]);
  
  const handleSearch = (term: string) => {
    onSearch(term);
    setSearchParams(prev => {
      if (term) {
        prev.set('q', term);
      } else {
        prev.delete('q');
      }
      return prev;
    });
  };
  
  const handleCategoryChange = (value: string) => {
    onCategoryChange(value);
    setSearchParams(prev => {
      if (value && value !== 'all') {
        prev.set('category', value);
      } else {
        prev.delete('category');
      }
      return prev;
    });
  };
  
  const handleSortChange = (value: string) => {
    onSortChange(value);
    setSearchParams(prev => {
      if (value) {
        prev.set('sort', value);
      } else {
        prev.delete('sort');
      }
      return prev;
    });
  };

  const handleStyleChange = (value: string) => {
    if (onStyleChange) onStyleChange(value);
    setSearchParams(prev => {
      if (value && value !== 'all') {
        prev.set('style', value);
      } else {
        prev.delete('style');
      }
      return prev;
    });
  };

  const handleCreatorChange = (value: string) => {
    if (onCreatorChange) onCreatorChange(value);
    setSearchParams(prev => {
      if (value && value !== 'all') {
        prev.set('creator', value);
      } else {
        prev.delete('creator');
      }
      return prev;
    });
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    if (onPriceRangeChange) onPriceRangeChange(value);
    setSearchParams(prev => {
      prev.set('minPrice', value[0].toString());
      prev.set('maxPrice', value[1].toString());
      return prev;
    });
  };

  const handleApplyFilters = () => {
    setOpenFilters(false);
    if (onPriceRangeChange) onPriceRangeChange(priceRange);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    onSearch('');
    onCategoryChange('all');
    onSortChange('newest');
    if (onStyleChange) onStyleChange('all');
    if (onCreatorChange) onCreatorChange('all');
    if (onPriceRangeChange) onPriceRangeChange([0, 1000]);
    setPriceRange([0, 1000]);
    setOpenFilters(false);
  };
  
  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold gradient-text rounded-lg">OpenMarket</h2>
        <Button 
          onClick={() => navigate("/marketplace")}
          variant="outline"
        >
          View All
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search designs, products, creators..."
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get('q') || ''}
            aria-label="Search marketplace items"
          />
        </div>
        
        <Select 
          onValueChange={handleCategoryChange}
          defaultValue={searchParams.get('category') || 'all'}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="dress">Dresses</SelectItem>
            <SelectItem value="suit">Suits</SelectItem>
            <SelectItem value="shoes">Shoes</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          onValueChange={handleSortChange}
          defaultValue={searchParams.get('sort') || 'newest'}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-liked">Most Liked</SelectItem>
            <SelectItem value="most-viewed">Most Viewed</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="best-rated">Best Rated</SelectItem>
          </SelectContent>
        </Select>

        <Sheet open={openFilters} onOpenChange={setOpenFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Advanced Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filter Options</SheetTitle>
              <SheetDescription>
                Refine your search with these additional filters
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Design Style</h3>
                <RadioGroup 
                  defaultValue={searchParams.get('style') || 'all'}
                  onValueChange={handleStyleChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-styles" />
                    <Label htmlFor="all-styles">All Styles</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimalist" id="minimalist" />
                    <Label htmlFor="minimalist">Minimalist</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vintage" id="vintage" />
                    <Label htmlFor="vintage">Vintage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="modern" id="modern" />
                    <Label htmlFor="modern">Modern</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="elegant" id="elegant" />
                    <Label htmlFor="elegant">Elegant</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Price Range</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <Slider
                    defaultValue={[
                      parseInt(searchParams.get('minPrice') || '0'),
                      parseInt(searchParams.get('maxPrice') || '1000')
                    ]}
                    max={1000}
                    step={10}
                    onValueChange={(values) => setPriceRange([values[0], values[1]])}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Creator Reputation</h3>
                <RadioGroup 
                  defaultValue={searchParams.get('rating') || 'all'}
                  onValueChange={(value) => {
                    setSearchParams(prev => {
                      if (value !== 'all') {
                        prev.set('rating', value);
                      } else {
                        prev.delete('rating');
                      }
                      return prev;
                    });
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-ratings" />
                    <Label htmlFor="all-ratings">All Ratings</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="5-stars" />
                    <Label htmlFor="5-stars">5 Stars</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="4-stars-plus" />
                    <Label htmlFor="4-stars-plus">4+ Stars</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="3-stars-plus" />
                    <Label htmlFor="3-stars-plus">3+ Stars</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={clearAllFilters}>Clear All</Button>
              <SheetClose asChild>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
