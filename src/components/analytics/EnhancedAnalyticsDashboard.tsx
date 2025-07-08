import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { FunnelAnalysis } from './FunnelAnalysis';
import { ABTestManager } from './ABTestManager';
import { InsightsPanel } from './InsightsPanel';
import { HeatmapViewer } from './HeatmapViewer';
import { PerformanceTracker } from './PerformanceTracker';
import { 
  BarChart, 
  TrendingUp, 
  Target, 
  Brain, 
  Activity,
  Zap
} from 'lucide-react';

export const EnhancedAnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Include performance tracker for automatic monitoring */}
      <PerformanceTracker />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="funnels" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Funnels
          </TabsTrigger>
          <TabsTrigger value="ab-tests" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            A/B Tests
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="heatmaps" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Heatmaps
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="funnels" className="space-y-6">
          <FunnelAnalysis />
        </TabsContent>

        <TabsContent value="ab-tests" className="space-y-6">
          <ABTestManager />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <InsightsPanel />
        </TabsContent>

        <TabsContent value="heatmaps" className="space-y-6">
          <HeatmapViewer />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance metrics would go here - using existing analytics dashboard for now */}
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};