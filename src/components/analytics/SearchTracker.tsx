
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAnalyticsContext } from '@/providers/AnalyticsProvider';
import { Search } from 'lucide-react';

interface SearchTrackerProps {
  onSearch: (query: string) => Promise<number>; // Should return number of results
  searchType: string;
  placeholder?: string;
  className?: string;
}

export const SearchTracker: React.FC<SearchTrackerProps> = ({
  onSearch,
  searchType,
  placeholder = "Search...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { trackSearch } = useAnalyticsContext();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const resultsCount = await onSearch(query);
      trackSearch(query, searchType, resultsCount);
    } catch (error) {
      trackSearch(query, searchType, 0);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch, searchType, trackSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isSearching}
      />
      <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
        <Search className="w-4 h-4" />
      </Button>
    </div>
  );
};
