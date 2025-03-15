
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useEffect } from "react";

interface MarketplaceHeaderProps {
  onSearch: (term: string) => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export const MarketplaceHeader = ({ onSearch, onSortChange, onCategoryChange }: MarketplaceHeaderProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use URL parameters for better SEO and user experience
  useEffect(() => {
    const searchTerm = searchParams.get('q');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    
    if (searchTerm) onSearch(searchTerm);
    if (category) onCategoryChange(category);
    if (sort) onSortChange(sort);
  }, [searchParams, onSearch, onCategoryChange, onSortChange]);
  
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
            placeholder="Search images..."
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get('q') || ''}
            aria-label="Search marketplace images"
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
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
