import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Package, FileText, Zap, TrendingDown } from 'lucide-react';
import { useResourceMonitor } from '@/hooks/useResourceMonitor';

export const BundleAnalyzer: React.FC = () => {
  const { analyzeBundleSize } = useResourceMonitor();
  const bundleData = analyzeBundleSize();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getTotalSize = () => {
    return bundleData.reduce((total, bundle) => total + bundle.size, 0);
  };

  const getSizeColor = (size: number) => {
    if (size > 1024 * 1024) return 'text-destructive'; // > 1MB
    if (size > 500 * 1024) return 'text-warning'; // > 500KB
    return 'text-success';
  };

  const getCompressionColor = (ratio: number) => {
    if (ratio > 70) return 'text-success';
    if (ratio > 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Bundle Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bundle Analysis
          </CardTitle>
          <CardDescription>
            JavaScript bundle sizes and compression analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {formatBytes(getTotalSize())}
              </div>
              <div className="text-sm text-muted-foreground">Total Bundle Size</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {bundleData.length}
              </div>
              <div className="text-sm text-muted-foreground">Script Files</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {Math.round(
                  bundleData.reduce((sum, bundle) => sum + bundle.compressionRatio, 0) / 
                  bundleData.length
                )}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Compression</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bundle Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bundleData.map((bundle, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{bundle.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {bundle.size > 0 ? 'Loaded' : 'Cached'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={getSizeColor(bundle.size)}>
                      {formatBytes(bundle.size)}
                    </span>
                    {bundle.compressionRatio > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={getCompressionColor(bundle.compressionRatio)}
                      >
                        -{bundle.compressionRatio}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress 
                    value={(bundle.size / getTotalSize()) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {bundle.uncompressed > 0 && (
                        <>Uncompressed: {formatBytes(bundle.uncompressed)}</>
                      )}
                    </span>
                    <span>{((bundle.size / getTotalSize()) * 100).toFixed(1)}% of total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Optimization Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bundleData.some(b => b.size > 1024 * 1024) && (
            <div className="flex gap-3 p-3 bg-destructive/10 rounded-lg">
              <Zap className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <div className="font-medium">Large Bundle Detected</div>
                <div className="text-sm text-muted-foreground">
                  Consider code splitting and lazy loading for bundles over 1MB.
                </div>
              </div>
            </div>
          )}

          {bundleData.some(b => b.compressionRatio < 50) && (
            <div className="flex gap-3 p-3 bg-warning/10 rounded-lg">
              <Package className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <div className="font-medium">Poor Compression</div>
                <div className="text-sm text-muted-foreground">
                  Enable gzip/brotli compression for better file size reduction.
                </div>
              </div>
            </div>
          )}

          {bundleData.length > 10 && (
            <div className="flex gap-3 p-3 bg-warning/10 rounded-lg">
              <FileText className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <div className="font-medium">Many Script Files</div>
                <div className="text-sm text-muted-foreground">
                  Consider bundling smaller scripts together to reduce HTTP requests.
                </div>
              </div>
            </div>
          )}

          {bundleData.every(b => b.size < 500 * 1024 && b.compressionRatio > 60) && (
            <div className="flex gap-3 p-3 bg-success/10 rounded-lg">
              <Zap className="h-5 w-5 text-success mt-0.5" />
              <div>
                <div className="font-medium">Well Optimized</div>
                <div className="text-sm text-muted-foreground">
                  Your bundles are well-sized and properly compressed.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};