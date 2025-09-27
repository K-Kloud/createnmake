import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Users, Eye, Zap, Target, BarChart3, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { AIInsightsCenter } from './AIInsightsCenter';
import { PredictiveInsights } from './PredictiveInsights';

const mockEngagementData = [
  { date: '2024-01', views: 12500, likes: 892, comments: 234, shares: 145 },
  { date: '2024-02', views: 15200, likes: 1120, comments: 312, shares: 189 },
  { date: '2024-03', views: 18900, likes: 1456, comments: 445, shares: 267 },
  { date: '2024-04', views: 22100, likes: 1789, comments: 523, shares: 334 },
  { date: '2024-05', views: 26800, likes: 2134, comments: 678, shares: 421 },
];

const mockUserBehavior = [
  { category: 'Design Creation', sessions: 8420, avgDuration: '12:34', conversionRate: 23.5 },
  { category: 'Marketplace Browse', sessions: 15600, avgDuration: '8:45', conversionRate: 18.2 },
  { category: 'Profile Management', sessions: 5230, avgDuration: '6:12', conversionRate: 34.7 },
  { category: 'Order Process', sessions: 3890, avgDuration: '15:23', conversionRate: 67.8 },
];

const mockAiInsights = [
  {
    type: 'trend',
    title: 'Peak Design Creation Hours',
    insight: 'Users are most active between 2-4 PM, with 34% higher engagement rates',
    confidence: 92,
    impact: 'high'
  },
  {
    type: 'behavior',
    title: 'Mobile vs Desktop Preferences',
    insight: 'Mobile users prefer browsing, desktop users prefer creating (73% vs 27%)',
    confidence: 88,
    impact: 'medium'
  },
  {
    type: 'conversion',
    title: 'Optimal Pricing Strategy',
    insight: 'Designs priced between £15-25 have highest conversion rates (45%)',
    confidence: 95,
    impact: 'high'
  }
];

export const AdvancedAnalyticsPanel: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState('engagement');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advanced Analytics & AI Insights</h2>
          <p className="text-muted-foreground">Deep dive into your platform performance with AI-powered insights</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          {refreshing ? 'Analyzing...' : 'Refresh AI Insights'}
        </Button>
      </div>

      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Behavior
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="ai-center" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95.5K</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7.3%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2-4 PM</div>
                <p className="text-xs text-muted-foreground">
                  34% higher activity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23.8%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5.3%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Engagement Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockEngagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="likes" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="comments" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Behavior Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUserBehavior.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{item.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.sessions.toLocaleString()} sessions • {item.avgDuration} avg duration
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{item.conversionRate}%</div>
                      <div className="text-sm text-muted-foreground">conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {mockAiInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{insight.insight}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Confidence:</span>
                        <Progress value={insight.confidence} className="w-24" />
                        <span className="text-sm">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Predictions & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">Next Week Forecast</h4>
                  <p className="text-sm text-muted-foreground">
                    Expected 28% increase in design creation activity based on seasonal trends and user behavior patterns.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Optimization Opportunity</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementing push notifications during peak hours could increase user engagement by 15-20%.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Revenue Opportunity</h4>
                  <p className="text-sm text-muted-foreground">
                    Introducing premium design templates could generate an additional £2,400-3,200 monthly revenue.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-center" className="space-y-4">
          <AIInsightsCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};