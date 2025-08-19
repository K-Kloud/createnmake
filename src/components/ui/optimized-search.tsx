import React, { memo, useCallback, useMemo, useState } from 'react';
import { useRetry } from '@/hooks/useRetry';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedSearchProps {
  onSearch: (query: string) => Promise<any[]>;
  placeholder?: string;
  debounceDelay?: number;
  minQueryLength?: number;
  className?: string;
  renderResult?: (result: any, index: number) => React.ReactNode;
  keyExtractor?: (result: any, index: number) => string | number;
  maxRetries?: number;
}

export const OptimizedSearch = memo(({
  onSearch,
  placeholder = 'Search...',
  debounceDelay = 300,
  minQueryLength = 2,
  className,
  renderResult,
  keyExtractor = (_, index) => index,
  maxRetries = 3,
}: OptimizedSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { executeWithRetry, isRetrying, retryCount } = useRetry({
    config: { maxRetries },
    onRetry: (attempt) => {
      console.log(`Retrying search, attempt ${attempt}`);
    },
    onSuccess: () => {
      setHasError(false);
    },
    onFailure: () => {
      setHasError(true);
    },
  });

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setHasError(false);

    try {
      const searchResults = await executeWithRetry(
        () => onSearch(searchQuery),
        'search operation'
      );
      setResults(searchResults || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [onSearch, minQueryLength, executeWithRetry]);

  const { debouncedCallback: debouncedSearch } = useDebounce(
    performSearch,
    { delay: debounceDelay }
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleRetry = useCallback(() => {
    if (query.length >= minQueryLength) {
      performSearch(query);
    }
  }, [query, minQueryLength, performSearch]);

  const showRetryButton = hasError && !isSearching && !isRetrying;
  const showLoader = isSearching || isRetrying;

  const statusIcon = useMemo(() => {
    if (showLoader) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (hasError) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (results.length > 0) {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
    return null;
  }, [showLoader, hasError, results.length]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            'pr-20',
            hasError && 'border-destructive focus-visible:ring-destructive'
          )}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {statusIcon}
          
          {isRetrying && retryCount > 0 && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {retryCount}/{maxRetries}
            </Badge>
          )}
          
          {showRetryButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRetry}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {query.length > 0 && query.length < minQueryLength && (
        <p className="text-sm text-muted-foreground">
          Type at least {minQueryLength} characters to search
        </p>
      )}

      {hasError && (
        <div className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Search failed. {showRetryButton && 'Click the retry button to try again.'}
        </div>
      )}

      {results.length > 0 && renderResult && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div key={keyExtractor(result, index)}>
              {renderResult(result, index)}
            </div>
          ))}
        </div>
      )}

      {query.length >= minQueryLength && !showLoader && !hasError && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No results found</p>
      )}
    </div>
  );
});