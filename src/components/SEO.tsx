
import { useEffect } from "react";
import { SEOProps } from "@/types/seo";

export const SEO = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = "website",
  metaTags = []
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Set canonical URL
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }

    // Set Open Graph tags
    const updateOgTag = (property: string, content: string) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', content);
    };

    updateOgTag('og:title', title);
    updateOgTag('og:description', description);
    updateOgTag('og:type', ogType);
    
    if (ogImage) {
      updateOgTag('og:image', ogImage);
    }

    // Set additional meta tags
    metaTags.forEach(tag => {
      const { name, property, content } = tag;
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      const attr = name ? 'name' : 'property';
      const value = name || property;

      if (!value) return;

      let metaTag = document.querySelector(selector);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attr, value);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    });

    // Cleanup function
    return () => {
      // We don't remove the tags as they should persist between page changes
    };
  }, [title, description, canonicalUrl, ogImage, ogType, metaTags]);

  return null; // This component doesn't render anything
};
