
import { useState, useEffect } from 'react';

// Define common breakpoints
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type Breakpoint = keyof typeof breakpoints;

export function useResponsive() {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions to check current breakpoint
  const isXs = windowWidth < breakpoints.sm;
  const isSm = windowWidth >= breakpoints.sm && windowWidth < breakpoints.md;
  const isMd = windowWidth >= breakpoints.md && windowWidth < breakpoints.lg;
  const isLg = windowWidth >= breakpoints.lg && windowWidth < breakpoints.xl;
  const isXl = windowWidth >= breakpoints.xl && windowWidth < breakpoints['2xl'];
  const is2Xl = windowWidth >= breakpoints['2xl'];
  
  // Helper to check if screen is at least a certain size
  const isAtLeast = (breakpoint: Breakpoint) => windowWidth >= breakpoints[breakpoint];
  
  // Helper to check if screen is smaller than a certain size
  const isSmallerThan = (breakpoint: Breakpoint) => windowWidth < breakpoints[breakpoint];

  return {
    windowWidth,
    breakpoints,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isAtLeast,
    isSmallerThan,
    // Current breakpoint name
    current: isXs 
      ? 'xs' 
      : isSm 
        ? 'sm' 
        : isMd 
          ? 'md' 
          : isLg 
            ? 'lg' 
            : isXl 
              ? 'xl' 
              : '2xl'
  };
}
