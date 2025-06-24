
import { lazy, ComponentType } from 'react';

// Lazy load components for better bundle splitting
export const useLazyComponents = () => {
  const LazyImageEditDialog = lazy(() => 
    import('@/components/editing/ImageEditDialog').then(module => ({
      default: module.ImageEditDialog
    }))
  );

  const LazyShareDialog = lazy(() => 
    import('@/components/sharing/ShareDialog').then(module => ({
      default: module.ShareDialog
    }))
  );

  const LazyUserProfileDialog = lazy(() => 
    import('@/components/profile/UserProfileDialog').then(module => ({
      default: module.UserProfileDialog
    }))
  );

  const LazyInpaintingDialog = lazy(() => 
    import('@/components/inpainting/InpaintingDialog').then(module => ({
      default: module.InpaintingDialog
    }))
  );

  return {
    LazyImageEditDialog,
    LazyShareDialog,
    LazyUserProfileDialog,
    LazyInpaintingDialog,
  };
};

// Preload components when user interactions suggest they might be needed
export const useComponentPreloading = () => {
  const preloadComponent = (importFn: () => Promise<any>) => {
    // Preload on hover or focus
    return {
      onMouseEnter: () => importFn(),
      onFocus: () => importFn(),
    };
  };

  const preloadImageEdit = preloadComponent(() => 
    import('@/components/editing/ImageEditDialog')
  );

  const preloadShare = preloadComponent(() => 
    import('@/components/sharing/ShareDialog')
  );

  const preloadProfile = preloadComponent(() => 
    import('@/components/profile/UserProfileDialog')
  );

  return {
    preloadImageEdit,
    preloadShare,
    preloadProfile,
  };
};
