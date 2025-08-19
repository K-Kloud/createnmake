import { useCallback, useEffect, useRef, useState } from 'react';

interface UseVirtualizedListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizedListReturn {
  startIndex: number;
  endIndex: number;
  visibleItems: number[];
  containerProps: {
    style: React.CSSProperties;
  };
  scrollElementProps: {
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  };
}

export const useVirtualizedList = (
  totalItems: number,
  options: UseVirtualizedListOptions
): VirtualizedListReturn => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);

  const visibleItems = Array.from(
    { length: endIndex - startIndex + 1 },
    (_, index) => startIndex + index
  );

  const totalHeight = totalItems * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const containerProps = {
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
    },
  };

  const scrollElementProps = {
    style: {
      height: totalHeight,
      position: 'relative' as const,
    },
    onScroll: handleScroll,
  };

  return {
    startIndex,
    endIndex,
    visibleItems,
    containerProps,
    scrollElementProps,
  };
};