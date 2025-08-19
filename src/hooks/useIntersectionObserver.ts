import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<any>, boolean] => {
  const {
    threshold = 0,
    rootMargin = '0px',
    root = null,
    freezeOnceVisible = false,
  } = options;

  const elementRef = useRef<any>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [wasIntersecting, setWasIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element) return;
    
    // If freezeOnceVisible is true and element was already visible, don't observe again
    if (freezeOnceVisible && wasIntersecting) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && !wasIntersecting) {
          setWasIntersecting(true);
        }
        
        // If freezeOnceVisible is true and element becomes visible, stop observing
        if (freezeOnceVisible && isElementIntersecting) {
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, root, freezeOnceVisible, wasIntersecting]);

  // Return the current intersecting state, or true if it was visible and frozen
  const currentState = freezeOnceVisible && wasIntersecting ? true : isIntersecting;

  return [elementRef, currentState];
};