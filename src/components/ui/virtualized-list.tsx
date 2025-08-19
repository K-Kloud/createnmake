import React, { memo, useMemo } from 'react';
import { useVirtualizedList } from '@/hooks/useVirtualizedList';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

export const VirtualizedList = memo(<T,>({
  items,
  itemHeight,
  height,
  renderItem,
  keyExtractor,
  className,
  overscan = 5,
  onScroll,
}: VirtualizedListProps<T>) => {
  const {
    visibleItems,
    containerProps,
    scrollElementProps,
  } = useVirtualizedList(items.length, {
    itemHeight,
    containerHeight: height,
    overscan,
  });

  const handleScroll = useMemo(() => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      scrollElementProps.onScroll(e);
      onScroll?.(e.currentTarget.scrollTop);
    };
  }, [scrollElementProps.onScroll, onScroll]);

  const offsetY = visibleItems.length > 0 ? visibleItems[0] * itemHeight : 0;

  return (
    <div
      className={cn('relative', className)}
      style={containerProps.style}
      onScroll={handleScroll}
    >
      <div style={scrollElementProps.style}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((index) => {
            const item = items[index];
            if (!item) return null;
            
            return (
              <div
                key={keyExtractor(item, index)}
                style={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {renderItem(item, index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}) as <T>(props: VirtualizedListProps<T>) => JSX.Element;