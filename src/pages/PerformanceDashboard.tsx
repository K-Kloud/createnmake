import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { BundleAnalyzer } from '@/components/performance/BundleAnalyzer';
import { Activity, Package, Zap, TrendingUp } from 'lucide-react';

const PerformanceDashboard: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Performance Dashboard - OpenTech</title>
        <meta name="description" content="Monitor and optimize your application's performance with real-time metrics and insights." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Performance Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Monitor your application's performance in real-time. Track Core Web Vitals, 
            analyze bundle sizes, and get actionable recommendations to optimize user experience.
          </p>
        </header>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Metrics
            </TabsTrigger>
            <TabsTrigger value="bundles" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Bundle Analysis
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Optimization
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="bundles" className="space-y-6">
            <BundleAnalyzer />
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Quick Wins</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Enable Image Optimization</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use WebP format and lazy loading for images
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Implement Code Splitting</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Split bundles by routes for faster initial load
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Enable Compression</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure gzip/brotli compression on your server
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Advanced Optimizations</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Preload Critical Resources</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use resource hints for critical CSS and fonts
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Optimize Third-party Scripts</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Defer non-critical third-party scripts
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Implement Service Worker</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cache resources for offline functionality
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Performance Trends</h3>
              <p className="text-muted-foreground">
                Historical performance data and trends will be displayed here.
                Monitor your application's performance over time to identify patterns and improvements.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PerformanceDashboard;