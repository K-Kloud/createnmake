import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Download, FileText, Zap } from "lucide-react";

interface BundleInfo {
  size: number;
  gzippedSize: number;
  chunks: {
    name: string;
    size: number;
    type: 'vendor' | 'app' | 'async';
  }[];
  recommendations: {
    type: 'warning' | 'success' | 'info';
    message: string;
    action?: string;
  }[];
}

export const BundleOptimizer = () => {
  const [bundleInfo, setBundleInfo] = useState<BundleInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBundleSize = async () => {
    setIsAnalyzing(true);
    
    // Simulate bundle analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockBundleInfo: BundleInfo = {
      size: 2.4 * 1024 * 1024, // 2.4MB
      gzippedSize: 850 * 1024, // 850KB
      chunks: [
        { name: 'vendor', size: 1.2 * 1024 * 1024, type: 'vendor' },
        { name: 'app', size: 800 * 1024, type: 'app' },
        { name: 'components', size: 400 * 1024, type: 'async' },
      ],
      recommendations: [
        {
          type: 'success',
          message: 'Bundle size is within recommended limits',
        },
        {
          type: 'warning',
          message: 'Some large dependencies detected in vendor chunk',
          action: 'Consider lazy loading or code splitting',
        },
        {
          type: 'info',
          message: 'Tree shaking is working effectively',
        },
      ],
    };
    
    setBundleInfo(mockBundleInfo);
    setIsAnalyzing(false);
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getBadgeVariant = (type: 'warning' | 'success' | 'info') => {
    switch (type) {
      case 'warning': return 'destructive';
      case 'success': return 'default';
      case 'info': return 'secondary';
    }
  };

  const getIcon = (type: 'warning' | 'success' | 'info') => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'info': return <FileText className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    analyzeBundleSize();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Bundle Optimizer
              </CardTitle>
              <CardDescription>
                Analyze and optimize your application bundle for production
              </CardDescription>
            </div>
            <Button onClick={analyzeBundleSize} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground">Analyzing bundle...</p>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          ) : bundleInfo ? (
            <div className="space-y-6">
              {/* Bundle Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatSize(bundleInfo.size)}</div>
                      <div className="text-sm text-muted-foreground">Total Size</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatSize(bundleInfo.gzippedSize)}</div>
                      <div className="text-sm text-muted-foreground">Gzipped Size</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{bundleInfo.chunks.length}</div>
                      <div className="text-sm text-muted-foreground">Code Chunks</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chunk Analysis */}
              <div>
                <h4 className="font-medium mb-3">Chunk Breakdown</h4>
                <div className="space-y-2">
                  {bundleInfo.chunks.map((chunk) => (
                    <div key={chunk.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={chunk.type === 'vendor' ? 'secondary' : 'outline'}>
                          {chunk.type}
                        </Badge>
                        <span className="font-medium">{chunk.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatSize(chunk.size)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-3">Optimization Recommendations</h4>
                <div className="space-y-2">
                  {bundleInfo.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-0.5">
                        {getIcon(rec.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getBadgeVariant(rec.type)} className="text-xs">
                            {rec.type}
                          </Badge>
                        </div>
                        <p className="text-sm">{rec.message}</p>
                        {rec.action && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Action: {rec.action}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};