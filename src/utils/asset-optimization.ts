// Asset optimization utilities for production

// Image format detection and optimization
export const getOptimalImageFormat = (): 'webp' | 'jpeg' => {
  // Check if browser supports WebP
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  // Try to create a WebP data URL
  try {
    const webpDataUrl = canvas.toDataURL('image/webp', 0.1);
    return webpDataUrl.indexOf('image/webp') === 5 ? 'webp' : 'jpeg';
  } catch {
    return 'jpeg';
  }
};

// Responsive image srcset generator
export const generateSrcSet = (baseUrl: string, widths: number[] = [320, 640, 960, 1280]): string => {
  const format = getOptimalImageFormat();
  
  return widths
    .map(width => {
      const optimizedUrl = optimizeImageUrl(baseUrl, { width, format, quality: 80 });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

// Image URL optimization for different services
export const optimizeImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  crop?: 'fill' | 'fit' | 'crop';
} = {}): string => {
  if (process.env.NODE_ENV !== 'production') {
    return url;
  }

  const { width, height, quality = 80, format = 'webp', crop = 'fit' } = options;

  // Supabase Storage transformations
  if (url.includes('supabase.co/storage')) {
    const urlObj = new URL(url);
    const params = new URLSearchParams();
    
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', quality.toString());
    params.set('format', format);
    params.set('resize', crop);
    
    urlObj.search = params.toString();
    return urlObj.toString();
  }

  // Cloudinary transformations (example)
  if (url.includes('cloudinary.com')) {
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    transformations.push(`c_${crop}`);
    
    return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
  }

  return url;
};

// Lazy loading intersection observer
export const createLazyLoadObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  return new IntersectionObserver(callback, options);
};

// Preload critical resources
export const preloadCriticalAssets = () => {
  const criticalAssets = [
    { href: '/placeholder.svg', as: 'image' },
    { href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap', as: 'style' },
    { href: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap', as: 'style' }
  ];

  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = asset.as as any;
    link.href = asset.href;
    document.head.appendChild(link);
  });
};

// Prefetch next-page resources
export const prefetchResources = (urls: string[]) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Critical CSS inlining
export const inlineCriticalCSS = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
};

// Font display optimization
export const optimizeFontLoading = () => {
  // Add font-display: swap to existing font links
  const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
  fontLinks.forEach(link => {
    const url = new URL(link.getAttribute('href') || '');
    if (!url.searchParams.has('display')) {
      url.searchParams.set('display', 'swap');
      link.setAttribute('href', url.toString());
    }
  });
};

// Resource hints for better loading performance
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const externalDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'supabase.co'
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical external domains
  const criticalDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  criticalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Initialize all optimizations
export const initializeAssetOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Run immediately
  addResourceHints();
  optimizeFontLoading();

  // Run after load
  window.addEventListener('load', () => {
    preloadCriticalAssets();
  });
};