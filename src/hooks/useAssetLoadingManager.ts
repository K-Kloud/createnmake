// Phase 4: Asset Loading Manager Hook (No JSX)
import { useState, useEffect, useCallback } from 'react';

interface AssetLoadingState {
  isLoading: boolean;
  progress: number;
  loadedAssets: number;
  totalAssets: number;
  failedAssets: string[];
  loadingAssets: string[];
}

interface AssetLoadingOptions {
  timeout?: number;
  retryAttempts?: number;
  preloadCriticalAssets?: boolean;
}

export const useAssetLoadingManager = (options: AssetLoadingOptions = {}) => {
  const {
    timeout = 10000,
    retryAttempts = 2,
    preloadCriticalAssets = true
  } = options;

  const [state, setState] = useState<AssetLoadingState>({
    isLoading: true,
    progress: 0,
    loadedAssets: 0,
    totalAssets: 0,
    failedAssets: [],
    loadingAssets: []
  });

  const [retryCount, setRetryCount] = useState(0);

  // Critical assets to preload
  const criticalAssets = [
    '/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png', // Logo
    // Add other critical assets here
  ];

  const preloadAsset = useCallback(async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log(`📥 [ASSET MANAGER] Starting preload: ${url}`);
      
      setState(prev => ({
        ...prev,
        loadingAssets: [...prev.loadingAssets, url]
      }));

      if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
        // Image preloading
        const img = new Image();
        
        const cleanup = () => {
          setState(prev => ({
            ...prev,
            loadingAssets: prev.loadingAssets.filter(asset => asset !== url)
          }));
        };

        img.onload = () => {
          console.log(`✅ [ASSET MANAGER] Image loaded: ${url}`);
          cleanup();
          resolve(true);
        };

        img.onerror = () => {
          console.error(`❌ [ASSET MANAGER] Image failed to load: ${url}`);
          cleanup();
          resolve(false);
        };

        // Timeout handling
        setTimeout(() => {
          console.warn(`⏰ [ASSET MANAGER] Image loading timeout: ${url}`);
          cleanup();
          resolve(false);
        }, timeout);

        img.src = url;
      } else if (url.match(/\.(woff|woff2|ttf|otf)$/i)) {
        // Font preloading
        const font = new FontFace('preload-font', `url(${url})`);
        
        font.load()
          .then(() => {
            console.log(`✅ [ASSET MANAGER] Font loaded: ${url}`);
            document.fonts.add(font);
            setState(prev => ({
              ...prev,
              loadingAssets: prev.loadingAssets.filter(asset => asset !== url)
            }));
            resolve(true);
          })
          .catch((error) => {
            console.error(`❌ [ASSET MANAGER] Font failed to load: ${url}`, error);
            setState(prev => ({
              ...prev,
              loadingAssets: prev.loadingAssets.filter(asset => asset !== url)
            }));
            resolve(false);
          });
      } else {
        // Generic asset preloading using fetch
        fetch(url, { method: 'HEAD' })
          .then(response => {
            const success = response.ok;
            console.log(`${success ? '✅' : '❌'} [ASSET MANAGER] Asset ${success ? 'loaded' : 'failed'}: ${url}`);
            setState(prev => ({
              ...prev,
              loadingAssets: prev.loadingAssets.filter(asset => asset !== url)
            }));
            resolve(success);
          })
          .catch((error) => {
            console.error(`❌ [ASSET MANAGER] Asset failed to load: ${url}`, error);
            setState(prev => ({
              ...prev,
              loadingAssets: prev.loadingAssets.filter(asset => asset !== url)
            }));
            resolve(false);
          });
      }
    });
  }, [timeout]);

  const preloadAssets = useCallback(async (assets: string[]) => {
    if (assets.length === 0) {
      setState(prev => ({ ...prev, isLoading: false, progress: 100 }));
      return;
    }

    console.log(`🚀 [ASSET MANAGER] Starting to preload ${assets.length} assets`);
    
    setState(prev => ({
      ...prev,
      totalAssets: assets.length,
      loadedAssets: 0,
      failedAssets: [],
      isLoading: true,
      progress: 0
    }));

    const results = await Promise.allSettled(
      assets.map(asset => preloadAsset(asset))
    );

    let loadedCount = 0;
    const failedAssets: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        loadedCount++;
      } else {
        failedAssets.push(assets[index]);
      }
    });

    const progress = (loadedCount / assets.length) * 100;

    setState(prev => ({
      ...prev,
      loadedAssets: loadedCount,
      failedAssets,
      progress,
      isLoading: false,
      loadingAssets: []
    }));

    console.log(`📊 [ASSET MANAGER] Asset loading complete: ${loadedCount}/${assets.length} loaded`);

    if (failedAssets.length > 0 && retryCount < retryAttempts) {
      console.log(`🔄 [ASSET MANAGER] Retrying failed assets (attempt ${retryCount + 1}/${retryAttempts})`);
      setRetryCount(prev => prev + 1);
      // Retry failed assets
      setTimeout(() => preloadAssets(failedAssets), 1000);
    }
  }, [preloadAsset, retryCount, retryAttempts]);

  const retryFailedAssets = useCallback(() => {
    if (state.failedAssets.length > 0) {
      console.log('🔄 [ASSET MANAGER] Manual retry of failed assets');
      setRetryCount(0);
      preloadAssets(state.failedAssets);
    }
  }, [state.failedAssets, preloadAssets]);

  useEffect(() => {
    if (preloadCriticalAssets) {
      preloadAssets(criticalAssets);
    } else {
      setState(prev => ({ ...prev, isLoading: false, progress: 100 }));
    }
  }, [preloadAssets, preloadCriticalAssets]);

  return {
    ...state,
    retryFailedAssets,
    preloadAssets
  };
};