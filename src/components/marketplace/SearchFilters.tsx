import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  activeFilters?: string[];
  onRemoveFilter?: (filter: string) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'tops', label: 'Tops & Shirts' },
  { value: 'bottoms', label: 'Bottoms & Pants' },
  { value: 'dresses', label: 'Dresses & Gowns' },
  { value: 'outerwear', label: 'Jackets & Coats' },
  { value: 'african', label: 'African Traditional' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Liked' },
  { value: 'trending', label: 'Most Viewed' },
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  sortBy,
  onSortChange,
  activeFilters = [],
  onRemoveFilter
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search fashion designs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="flex-1 min-w-[200px]">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || category !== 'all' || sortBy !== 'recent') && (
          <Button
            variant="outline"
            onClick={() => {
              onSearchChange('');
              onCategoryChange('all');
              onSortChange('recent');
            }}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Filter className="w-3 h-3" />
            Active filters:
          </span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => onRemoveFilter?.(filter)}
            >
              {filter}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};