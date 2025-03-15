
/**
 * Utility functions for SEO optimization
 */

// Function to remove duplicate content with canonical URLs
export const setCanonicalLink = (url: string) => {
  // Remove any existing canonical links
  const existingCanonical = document.querySelector('link[rel="canonical"]');
  if (existingCanonical) {
    existingCanonical.remove();
  }
  
  // Add the new canonical link
  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = url;
  document.head.appendChild(link);
};

// Add structured data for different page types
export const addStructuredData = (type: 'Organization' | 'Product' | 'BlogPosting' | 'FAQPage', data: any) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  
  // Add context and type to the data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data
  };
  
  script.innerHTML = JSON.stringify(structuredData);
  document.head.appendChild(script);
  
  // Return a function to clean up
  return () => {
    document.head.removeChild(script);
  };
};

// Function to optimize images by loading them lazily
export const optimizeImage = (url: string, alt: string, className?: string) => {
  return (
    <img 
      src={url} 
      alt={alt} 
      loading="lazy" 
      className={className || ''}
      onError={(e) => {
        // Fallback to a placeholder if the image fails to load
        (e.target as HTMLImageElement).src = '/placeholder.svg';
      }}
    />
  );
};

// Set meta title and description dynamically
export const updateMetaTags = (title: string, description: string) => {
  // Update title
  document.title = title;
  
  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);
  
  // Update OG tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  
  if (ogTitle) ogTitle.setAttribute('content', title);
  if (ogDescription) ogDescription.setAttribute('content', description);
};
