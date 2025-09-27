import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataLakeManager } from '@/components/data/DataLakeManager';
import { BusinessIntelligenceDashboard } from '@/components/analytics/BusinessIntelligenceDashboard';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';
import { Database, BarChart3, Brain, TrendingUp, Users, DollarSign, Target, Activity } from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const overviewMetrics: MetricCard[] = [
    {
      title: 'Data Lake Size',
      value: '45.2 TB',
      change: '+12% this month',
      trend: 'up',
      icon: <Database className="h-5 w-5" />
    },
    {
      title: 'Active Data Sources',
      value: '24',
      change: '+3 new sources',
      trend: 'up',
      icon: <Activity className="h-5 w-5" />
    },
    {
      title: 'ML Models',
      value: '12',
      change: '3 retrained',
      trend: 'stable',
      icon: <Brain className="h-5 w-5" />
    },
    {
      title: 'Prediction Accuracy',
      value: '89.2%',
      change: '+2.1% improvement',
      trend: 'up',
      icon: <Target className="h-5 w-5" />
    },
    {
      title: 'Revenue Impact',
      value: '$2.4M',
      change: '+18% from insights',
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: 'Users Analyzed',
      value: '156K',
      change: '+23% growth',
      trend: 'up',
      icon: <Users className="h-5 w-5" />
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground rotate-90" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Train Models
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data-lake">Data Lake</TabsTrigger>
          <TabsTrigger value="business-intelligence">Business Intelligence</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overviewMetrics.map((metric) => (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  {metric.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    {metric.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Pipeline Health</CardTitle>
                <CardDescription>Status of active data processing pipelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Image Processing Pipeline</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-success rounded-full"></div>
                      <span className="text-sm text-success">Running</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Analytics ETL</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-success rounded-full"></div>
                      <span className="text-sm text-success">Running</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ML Feature Engineering</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-warning rounded-full"></div>
                      <span className="text-sm text-warning">Processing</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time Analytics</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-success rounded-full"></div>
                      <span className="text-sm text-success">Running</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Insights</CardTitle>
                <CardDescription>Latest AI-generated business insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">Demand Spike Predicted</p>
                    <p className="text-xs text-muted-foreground">
                      18% increase in demand expected for winter collection in next 2 weeks
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="text-sm font-medium">Churn Risk Alert</p>
                    <p className="text-xs text-muted-foreground">
                      23 high-value customers identified as high churn risk
                    </p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg">
                    <p className="text-sm font-medium">Price Optimization</p>
                    <p className="text-xs text-muted-foreground">
                      Revenue increase of $45K predicted with recommended price adjustments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data-lake">
          <DataLakeManager />
        </TabsContent>

        <TabsContent value="business-intelligence">
          <BusinessIntelligenceDashboard />
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};