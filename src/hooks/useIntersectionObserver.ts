
import { useEffect, useState, RefObject } from 'react';

interface UseIntersectionObserverProps {
  elementRef: RefObject<Element>;
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

export const useIntersectionObserver = ({
  elementRef,
  threshold = 0,
  rootMargin = '0px',
  root = null,
}: UseIntersectionObserverProps) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, rootMargin, root]);

  return { isIntersecting, entry };
};
