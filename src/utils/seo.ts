export const addStructuredData = (type: string, data: Record<string, any>) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
  
  // Return cleanup function
  return () => {
    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  };
};

export const generateStructuredData = (type: 'website' | 'marketplace' | 'product', data: any) => {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type === 'website' ? 'WebSite' : type === 'marketplace' ? 'OnlineStore' : 'Product',
    ...data
  };
  
  return baseData;
};