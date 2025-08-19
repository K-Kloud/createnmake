// Phase 4: CSS Loading Monitor Hook (No JSX)
import { useEffect, useState } from 'react';

interface CSSLoadingState {
  isLoaded: boolean;
  hasError: boolean;
  loadedSheets: number;
  totalSheets: number;
}

export const useCSSLoadingMonitor = () => {
  const [cssState, setCSSState] = useState<CSSLoadingState>({
    isLoaded: false,
    hasError: false,
    loadedSheets: 0,
    totalSheets: 0
  });

  useEffect(() => {
    console.log('🎨 [CSS MONITOR] Starting CSS loading monitor...');
    
    const checkCSSLoading = () => {
      const styleSheets = Array.from(document.styleSheets);
      const externalSheets = styleSheets.filter(sheet => {
        try {
          return sheet.href && !sheet.href.includes('data:');
        } catch (e) {
          return false;
        }
      });

      console.log(`🎨 [CSS MONITOR] Found ${externalSheets.length} external stylesheets`);

      let loadedCount = 0;
      let hasError = false;

      externalSheets.forEach((sheet, index) => {
        try {
          // Try to access rules to check if stylesheet is loaded
          const rules = sheet.cssRules || sheet.rules;
          if (rules && rules.length > 0) {
            loadedCount++;
            console.log(`✅ [CSS MONITOR] Stylesheet ${index + 1} loaded: ${sheet.href}`);
          }
        } catch (error) {
          // Cross-origin stylesheets might throw errors, but they could still be loaded
          if (sheet.href) {
            loadedCount++;
            console.log(`⚠️ [CSS MONITOR] Stylesheet ${index + 1} loaded (cross-origin): ${sheet.href}`);
          } else {
            hasError = true;
            console.error(`❌ [CSS MONITOR] Error loading stylesheet ${index + 1}:`, error);
          }
        }
      });

      setCSSState({
        isLoaded: loadedCount === externalSheets.length && externalSheets.length > 0,
        hasError,
        loadedSheets: loadedCount,
        totalSheets: externalSheets.length
      });

      if (loadedCount === externalSheets.length && externalSheets.length > 0) {
        console.log('✅ [CSS MONITOR] All stylesheets loaded successfully');
      }
    };

    // Initial check
    checkCSSLoading();

    // Monitor for new stylesheets
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const element = node as Element;
              if (element.tagName === 'LINK' && element.getAttribute('rel') === 'stylesheet') {
                console.log('🔍 [CSS MONITOR] New stylesheet detected, rechecking...');
                setTimeout(checkCSSLoading, 100);
              }
            }
          });
        }
      });
    });

    observer.observe(document.head, { childList: true, subtree: true });

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('⏰ [CSS MONITOR] CSS loading timeout reached');
      setCSSState(prev => ({ ...prev, isLoaded: true }));
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return cssState;
};

// Phase 4: Critical CSS injection for above-the-fold content
export const injectCriticalCSS = () => {
  console.log('🚀 [CSS MONITOR] Injecting critical CSS...');
  
  const criticalCSS = `
    /* Critical CSS for preventing FOUC */
    body {
      margin: 0;
      padding: 0;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background-color: hsl(15 15 26);
      color: hsl(255 255 255);
      min-height: 100vh;
    }
    
    #root {
      min-height: 100vh;
      width: 100%;
    }
    
    /* Loading spinner styles */
    .css-loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(0, 230, 160, 0.3);
      border-radius: 50%;
      border-top-color: rgb(0, 230, 160);
      animation: css-spin 1s ease-in-out infinite;
    }
    
    @keyframes css-spin {
      to { transform: rotate(360deg); }
    }
    
    /* Prevent layout shift */
    .prevent-fouc {
      visibility: hidden;
    }
    
    .css-loaded .prevent-fouc {
      visibility: visible;
    }
  `;

  const existingCriticalCSS = document.getElementById('critical-css');
  if (!existingCriticalCSS) {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
    console.log('✅ [CSS MONITOR] Critical CSS injected');
  }
};