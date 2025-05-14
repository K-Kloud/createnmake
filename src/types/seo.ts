
export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'BlogPosting' | 'FAQPage' | 'LocalBusiness' | 'WebSite';
  data: Record<string, any>;
}

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  metaTags?: MetaTag[];
}
