// Phase 3: Component preloader for critical sections
import React, { ComponentType, LazyExoticComponent } from 'react';

interface PreloadConfig {
  component: () => Promise<{ default: ComponentType<any> }>;
  priority: 'high' | 'medium' | 'low';
  preloadCondition?: () => boolean;
}

class ComponentPreloader {
  private preloadedComponents = new Map<string, Promise<any>>();
  private preloadQueue: Array<{ key: string; config: PreloadConfig }> = [];
  private isPreloading = false;

  // Register components for preloading
  register(key: string, config: PreloadConfig) {
    console.log(`📋 [PRELOADER] Registering component for preload: ${key} (priority: ${config.priority})`);
    
    if (config.priority === 'high') {
      this.preloadQueue.unshift({ key, config });
    } else {
      this.preloadQueue.push({ key, config });
    }
    
    this.processQueue();
  }

  // Preload a specific component
  async preload(key: string, componentLoader: () => Promise<{ default: ComponentType<any> }>): Promise<void> {
    if (this.preloadedComponents.has(key)) {
      console.log(`✅ [PRELOADER] Component already preloaded: ${key}`);
      return;
    }

    console.log(`🚀 [PRELOADER] Starting preload for: ${key}`);
    const preloadPromise = componentLoader().catch(error => {
      console.error(`❌ [PRELOADER] Failed to preload ${key}:`, error);
      throw error;
    });

    this.preloadedComponents.set(key, preloadPromise);
    
    try {
      await preloadPromise;
      console.log(`✅ [PRELOADER] Successfully preloaded: ${key}`);
    } catch (error) {
      this.preloadedComponents.delete(key);
      throw error;
    }
  }

  // Get preloaded component
  get(key: string): Promise<any> | undefined {
    return this.preloadedComponents.get(key);
  }

  // Check if component is preloaded
  isPreloaded(key: string): boolean {
    return this.preloadedComponents.has(key);
  }

  // Process the preload queue
  private async processQueue() {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      return;
    }

    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      const { key, config } = this.preloadQueue.shift()!;
      
      // Check preload condition if provided
      if (config.preloadCondition && !config.preloadCondition()) {
        console.log(`⏭️ [PRELOADER] Skipping ${key} - condition not met`);
        continue;
      }

      try {
        await this.preload(key, config.component);
        
        // Add delay between preloads to not overwhelm the browser
        if (config.priority === 'low') {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ [PRELOADER] Queue processing error for ${key}:`, error);
      }
    }

    this.isPreloading = false;
  }

  // Preload components based on route or user interaction
  preloadForRoute(route: string) {
    console.log(`🛣️ [PRELOADER] Preloading components for route: ${route}`);
    
    const routeComponents: Record<string, string[]> = {
      '/': ['ImageGenerator', 'OpenMarketSection'],
      '/dashboard': ['Dashboard', 'AnalyticsCharts'],
      '/marketplace': ['MarketplaceGrid', 'ProductDetail'],
    };

    const componentsToPreload = routeComponents[route] || [];
    componentsToPreload.forEach(componentKey => {
      if (!this.isPreloaded(componentKey)) {
        // This would need to be connected to actual component imports
        console.log(`📅 [PRELOADER] Queuing route-based preload: ${componentKey}`);
      }
    });
  }

  // Clear preloaded components (useful for memory management)
  clear() {
    console.log(`🧹 [PRELOADER] Clearing preloaded components`);
    this.preloadedComponents.clear();
    this.preloadQueue = [];
  }
}

export const componentPreloader = new ComponentPreloader();

// Hook for using preloaded components
export const usePreloadedComponent = (key: string) => {
  const preloadedPromise = componentPreloader.get(key);
  
  return {
    isPreloaded: componentPreloader.isPreloaded(key),
    getComponent: () => preloadedPromise
  };
};

// Enhanced lazy loading with preload support
export const lazyWithPreload = <T extends ComponentType<any>>(
  componentLoader: () => Promise<{ default: T }>,
  preloadKey: string,
  priority: 'high' | 'medium' | 'low' = 'medium'
): LazyExoticComponent<T> => {
  // Register for preloading
  componentPreloader.register(preloadKey, {
    component: componentLoader,
    priority
  });

  // Return enhanced lazy component
  const LazyComponent = React.lazy(() => {
    const preloaded = componentPreloader.get(preloadKey);
    return preloaded || componentLoader();
  }) as LazyExoticComponent<T>;

  return LazyComponent;
};