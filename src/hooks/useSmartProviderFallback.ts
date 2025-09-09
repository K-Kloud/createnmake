import { useMemo } from 'react';

export interface ProviderCapabilities {
  supportsReferenceImages: boolean;
  referenceImageType: 'variations' | 'visual_context' | 'style_analysis' | 'none';
  isRecommendedForReference: boolean;
  fallbackPriority: number;
}

const PROVIDER_CAPABILITIES: Record<string, ProviderCapabilities> = {
  openai: {
    supportsReferenceImages: true,
    referenceImageType: 'variations',
    isRecommendedForReference: true,
    fallbackPriority: 1
  },
  gemini: {
    supportsReferenceImages: true,
    referenceImageType: 'visual_context',
    isRecommendedForReference: true,
    fallbackPriority: 2
  },
  xai: {
    supportsReferenceImages: true,
    referenceImageType: 'style_analysis',
    isRecommendedForReference: false,
    fallbackPriority: 3
  },
  huggingface: {
    supportsReferenceImages: true,
    referenceImageType: 'style_analysis',
    isRecommendedForReference: false,
    fallbackPriority: 4
  }
};

export const useSmartProviderFallback = (
  selectedProvider: string,
  hasReferenceImage: boolean
) => {
  const providerOrder = useMemo(() => {
    const allProviders = Object.keys(PROVIDER_CAPABILITIES);
    
    if (!hasReferenceImage) {
      // Normal fallback order when no reference image
      return [selectedProvider, ...allProviders.filter(p => p !== selectedProvider)];
    }

    // Smart fallback when reference image is present
    const referenceCapableProviders = allProviders
      .filter(provider => PROVIDER_CAPABILITIES[provider].supportsReferenceImages)
      .sort((a, b) => {
        // First, prioritize the selected provider
        if (a === selectedProvider) return -1;
        if (b === selectedProvider) return 1;
        
        // Then prioritize recommended providers
        const aRecommended = PROVIDER_CAPABILITIES[a].isRecommendedForReference;
        const bRecommended = PROVIDER_CAPABILITIES[b].isRecommendedForReference;
        
        if (aRecommended && !bRecommended) return -1;
        if (!aRecommended && bRecommended) return 1;
        
        // Finally, use fallback priority
        return PROVIDER_CAPABILITIES[a].fallbackPriority - PROVIDER_CAPABILITIES[b].fallbackPriority;
      });

    return referenceCapableProviders;
  }, [selectedProvider, hasReferenceImage]);

  const getProviderCapabilities = (provider: string): ProviderCapabilities => {
    return PROVIDER_CAPABILITIES[provider] || {
      supportsReferenceImages: false,
      referenceImageType: 'none',
      isRecommendedForReference: false,
      fallbackPriority: 999
    };
  };

  const getRecommendedProvider = (hasReferenceImage: boolean): string => {
    if (!hasReferenceImage) {
      return selectedProvider;
    }

    // Find the best provider for reference images
    const recommendedProviders = Object.entries(PROVIDER_CAPABILITIES)
      .filter(([_, caps]) => caps.isRecommendedForReference)
      .sort(([_, a], [__, b]) => a.fallbackPriority - b.fallbackPriority);

    return recommendedProviders.length > 0 ? recommendedProviders[0][0] : selectedProvider;
  };

  return {
    providerOrder,
    getProviderCapabilities,
    getRecommendedProvider,
    capabilities: PROVIDER_CAPABILITIES
  };
};