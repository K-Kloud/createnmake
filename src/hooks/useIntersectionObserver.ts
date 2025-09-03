import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  onIntersect?: () => void;
}

export const useIntersectionObserver = (options: UseIntersectionObserverOptions = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
        
        if (entry.isIntersecting && options.onIntersect) {
          options.onIntersect();
        }
      },
      {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || '0px',
        root: options.root || null
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, options.root, options.onIntersect]);

  return {
    ref: elementRef,
    isIntersecting,
    entry
  };
};