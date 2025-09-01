/**
 * Utility functions for SEO optimization
 */
import React from 'react';
import { StructuredDataProps } from '@/types/seo';
import { Helmet } from "react-helmet";

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export const SEO = ({
  title,
  description,
  canonicalUrl: canonical,
  ogImage,
  ogType = "website",
  noIndex = false,
  keywords = [],
}: SEOProps) => {
  const baseTitle = "Lovable Fashion Designer";
  const siteUrl = window.location.origin;
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  const defaultDescription = 
    "Design and create beautiful clothing and fashion items with AI. Generate garments, collaborate with makers, and bring your fashion ideas to reality.";
  const metaDescription = description || defaultDescription;
  const metaImage = ogImage || `${siteUrl}/og-image.png`;
  const canonicalUrl = canonical || siteUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Preconnect to Supabase for faster database requests */}
      <link rel="preconnect" href="https://igkiffajkpfwdfxwokwg.supabase.co" />
      <link rel="dns-prefetch" href="https://igkiffajkpfwdfxwokwg.supabase.co" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      
      {/* Other Meta Tags */}
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      
      {/* Index Control */}
      {noIndex && (
        <>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="googlebot" content="noindex, nofollow" />
        </>
      )}
    </Helmet>
  );
};

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
export const addStructuredData = (type: 'Organization' | 'Product' | 'BlogPosting' | 'FAQPage' | 'LocalBusiness' | 'WebSite', data: any) => {
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

// Generate sitemap data for dynamic pages
export const generateSitemapEntry = (url: string, changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never', priority: number) => {
  return {
    url,
    changeFreq,
    priority,
    lastMod: new Date().toISOString().split('T')[0]
  };
};
