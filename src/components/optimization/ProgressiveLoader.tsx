
import { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProgressiveLoaderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  pageSize?: number;
  threshold?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function ProgressiveLoader<T>({
  items,
  renderItem,
  pageSize = 20,
  threshold = 0.1,
  className = '',
  loadingComponent,
  hasMore = false,
  onLoadMore,
}: ProgressiveLoaderProps<T>) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMoreItems = visibleCount < items.length || hasMore;

  // Intersection observer for infinite scroll
  const { isIntersecting } = useIntersectionObserver({
    elementRef: loadMoreRef,
    threshold,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isIntersecting && hasMoreItems && !isLoading) {
      setIsLoading(true);
      
      // If we have more items locally, show them
      if (visibleCount < items.length) {
        const newCount = Math.min(items.length, visibleCount + pageSize);
        setTimeout(() => {
          setVisibleCount(newCount);
          setIsLoading(false);
        }, 300); // Small delay for better UX
      } 
      // If we need to load more from external source
      else if (hasMore && onLoadMore) {
        onLoadMore();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [isIntersecting, hasMoreItems, isLoading, visibleCount, items.length, pageSize, hasMore, onLoadMore]);

  // Reset visible count when items change
  useEffect(() => {
    if (items.length < visibleCount) {
      setVisibleCount(Math.min(items.length, pageSize));
    }
  }, [items.length, visibleCount, pageSize]);

  return (
    <div className={className}>
      {/* Render visible items */}
      {visibleItems.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* Loading indicator */}
      {hasMoreItems && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isLoading ? (
            loadingComponent || (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span className="text-muted-foreground">Loading more...</span>
              </div>
            )
          ) : (
            <div className="text-muted-foreground text-sm">
              Scroll to load more
            </div>
          )}
        </div>
      )}

      {/* End message */}
      {!hasMoreItems && items.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          You've reached the end
        </div>
      )}
    </div>
  );
}
