// Phase 4: Asset Loading Provider to manage global asset loading state
import React, { createContext, useContext, ReactNode } from 'react';
import { useAssetLoadingManager } from '@/hooks/useAssetLoadingManager';
import { useCSSLoadingMonitor } from '@/hooks/useCSSLoadingMonitor';
import { CSSLoadingIndicator, AssetLoadingIndicator } from '@/components/loading/AssetLoadingComponents';

interface AssetLoadingContextType {
  isAssetsLoading: boolean;
  isCSSLoading: boolean;
  assetProgress: number;
  retryFailedAssets: () => void;
  preloadAssets: (assets: string[]) => Promise<void>;
}

const AssetLoadingContext = createContext<AssetLoadingContextType | undefined>(undefined);

interface AssetLoadingProviderProps {
  children: ReactNode;
  preloadCriticalAssets?: boolean;
}

export const AssetLoadingProvider: React.FC<AssetLoadingProviderProps> = ({
  children,
  preloadCriticalAssets = true
}) => {
  console.log('🎯 [ASSET PROVIDER] Initializing asset loading provider...');

  const assetManager = useAssetLoadingManager({
    timeout: 10000,
    retryAttempts: 2,
    preloadCriticalAssets
  });

  const cssState = useCSSLoadingMonitor();

  const contextValue: AssetLoadingContextType = {
    isAssetsLoading: assetManager.isLoading,
    isCSSLoading: !cssState.isLoaded,
    assetProgress: assetManager.progress,
    retryFailedAssets: assetManager.retryFailedAssets,
    preloadAssets: assetManager.preloadAssets
  };

  const showAssetIndicator = assetManager.isLoading || assetManager.failedAssets.length > 0;

  return (
    <AssetLoadingContext.Provider value={contextValue}>
      {/* CSS Loading Indicator - shows until CSS is loaded */}
      <CSSLoadingIndicator />
      
      {/* Asset Loading Indicator - shows progress for assets */}
      <AssetLoadingIndicator
        show={showAssetIndicator}
        progress={assetManager.progress}
        loadedAssets={assetManager.loadedAssets}
        totalAssets={assetManager.totalAssets}
        failedAssets={assetManager.failedAssets}
        onRetry={assetManager.retryFailedAssets}
      />
      
      {/* Prevent FOUC wrapper */}
      <div className={`prevent-fouc ${cssState.isLoaded ? 'css-loaded' : ''}`}>
        {children}
      </div>
    </AssetLoadingContext.Provider>
  );
};

export const useAssetLoading = () => {
  const context = useContext(AssetLoadingContext);
  if (context === undefined) {
    throw new Error('useAssetLoading must be used within an AssetLoadingProvider');
  }
  return context;
};

// Phase 4: Optimize image loading with lazy loading and WebP support
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = React.useState<string>(src);
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // WebP support detection
  React.useEffect(() => {
    const supportsWebP = () => {
      return new Promise<boolean>((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
          resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });
    };

    const optimizeImageSrc = async () => {
      if (src.includes('.webp')) {
        // Already WebP
        setImageSrc(src);
        return;
      }

      const isWebPSupported = await supportsWebP();
      if (isWebPSupported && src.includes('.')) {
        // Try to use WebP version if available
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        // Test if WebP version exists
        const testImg = new Image();
        testImg.onload = () => setImageSrc(webpSrc);
        testImg.onerror = () => setImageSrc(src);
        testImg.src = webpSrc;
      } else {
        setImageSrc(src);
      }
    };

    optimizeImageSrc();
  }, [src]);

  const handleLoad = () => {
    console.log(`✅ [OPTIMIZED IMAGE] Image loaded: ${imageSrc}`);
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    console.error(`❌ [OPTIMIZED IMAGE] Image failed to load: ${imageSrc}`);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}
        style={{ width, height }}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      loading={priority ? "eager" : "lazy"}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        ...(width && height && { aspectRatio: `${width}/${height}` })
      }}
    />
  );
};