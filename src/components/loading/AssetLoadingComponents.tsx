// Phase 4: Asset Loading Components (JSX)
import React, { useEffect } from 'react';
import { useCSSLoadingMonitor, injectCriticalCSS } from '@/hooks/useCSSLoadingMonitor';

// Phase 4: CSS loading status component
export const CSSLoadingIndicator = () => {
  const cssState = useCSSLoadingMonitor();

  // Inject critical CSS on mount
  useEffect(() => {
    injectCriticalCSS();
  }, []);

  // Add CSS loaded class to body when ready
  useEffect(() => {
    if (cssState.isLoaded) {
      document.body.classList.add('css-loaded');
      console.log('✅ [CSS MONITOR] CSS loaded class added to body');
    }
  }, [cssState.isLoaded]);

  if (cssState.isLoaded) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'hsl(15 15 26)',
        color: 'hsl(255 255 255)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      <div className="css-loading-spinner"></div>
      <div style={{ fontSize: '14px', opacity: 0.8 }}>
        Loading styles... ({cssState.loadedSheets}/{cssState.totalSheets})
      </div>
      {cssState.hasError && (
        <div style={{ fontSize: '12px', color: 'hsl(255 92 92)', marginTop: '0.5rem' }}>
          Some styles failed to load
        </div>
      )}
    </div>
  );
};

// Phase 4: Asset Loading Progress Component
interface AssetLoadingIndicatorProps {
  show: boolean;
  progress: number;
  loadedAssets: number;
  totalAssets: number;
  failedAssets: string[];
  onRetry?: () => void;
}

export const AssetLoadingIndicator: React.FC<AssetLoadingIndicatorProps> = ({
  show,
  progress,
  loadedAssets,
  totalAssets,
  failedAssets,
  onRetry
}) => {
  if (!show) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'hsl(15 15 26 / 0.9)',
        color: 'hsl(255 255 255)',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000,
        border: '1px solid hsl(255 255 255 / 0.1)',
        backdropFilter: 'blur(8px)',
        minWidth: '200px'
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: '500' }}>
        Loading Assets ({loadedAssets}/{totalAssets})
      </div>
      
      <div style={{ 
        width: '100%', 
        height: '4px', 
        backgroundColor: 'hsl(255 255 255 / 0.1)', 
        borderRadius: '2px',
        marginBottom: '8px'
      }}>
        <div 
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'hsl(0 230 160)',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {failedAssets.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ color: 'hsl(255 92 92)', fontSize: '11px' }}>
            {failedAssets.length} assets failed to load
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                marginTop: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                backgroundColor: 'hsl(0 230 160)',
                color: 'hsl(15 15 26)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};