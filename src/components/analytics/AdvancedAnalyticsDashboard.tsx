import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  AlertTriangle, 
  Target, 
  Users, 
  DollarSign,
  Activity,
  Zap,
  Eye,
  Clock,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  data: any;
  actionItems: string[];
}

interface PredictiveMetric {
  metric: string;
  current: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  timeframe: string;
}

interface AnomalyDetection {
  metric: string;
  currentValue: number;
  expectedRange: [number, number];
  severity: 'critical' | 'warning' | 'info';
  detectedAt: string;
  description: string;
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [predictions, setPredictions] = useState<PredictiveMetric[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);

  // Fetch analytics insights
  const { data: analyticsInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['analytics-insights', selectedTimeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });

  // Generate mock predictive analytics
  useEffect(() => {
    const mockPredictions: PredictiveMetric[] = [
      {
        metric: 'User Growth',
        current: 1250,
        predicted: 1580,
        trend: 'up',
        confidence: 0.87,
        timeframe: 'Next 30 days'
      },
      {
        metric: 'Conversion Rate',
        current: 3.2,
        predicted: 3.8,
        trend: 'up',
        confidence: 0.74,
        timeframe: 'Next 14 days'
      },
      {
        metric: 'Churn Rate',
        current: 5.1,
        predicted: 4.3,
        trend: 'down',
        confidence: 0.82,
        timeframe: 'Next 30 days'
      },
      {
        metric: 'Revenue',
        current: 45600,
        predicted: 52100,
        trend: 'up',
        confidence: 0.91,
        timeframe: 'Next 30 days'
      }
    ];

    const mockAnomalies: AnomalyDetection[] = [
      {
        metric: 'API Response Time',
        currentValue: 850,
        expectedRange: [200, 500],
        severity: 'warning',
        detectedAt: new Date().toISOString(),
        description: 'API response times are 70% higher than normal'
      },
      {
        metric: 'Error Rate',
        currentValue: 2.3,
        expectedRange: [0, 1.0],
        severity: 'critical',
        detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        description: 'Error rate exceeds acceptable threshold'
      }
    ];

    setPredictions(mockPredictions);
    setAnomalies(mockAnomalies);
  }, [selectedTimeRange]);

  // Generate insights from analytics data
  useEffect(() => {
    if (analyticsInsights) {
      const generatedInsights: AnalyticsInsight[] = analyticsInsights.map(insight => ({
        id: insight.id,
        title: insight.title,
        description: insight.description,
        type: insight.insight_type as any,
        impact: 'medium' as const,
        confidence: insight.confidence_score || 0.8,
        data: insight.metadata,
        actionItems: Array.isArray(insight.action_items) ? insight.action_items as string[] : []
      }));

      setInsights(generatedInsights);
    }
  }, [analyticsInsights]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string): "destructive" | "secondary" | "default" | "outline" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'destructive';
      default: return 'secondary';
    }
  };

  const getImpactColor = (impact: string): "destructive" | "secondary" | "default" | "outline" => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      default: return 'secondary';
    }
  };

  // Mock funnel data
  const funnelData = [
    { stage: 'Visitors', value: 10000, conversion: 100 },
    { stage: 'Signups', value: 3200, conversion: 32 },
    { stage: 'Activated', value: 2400, conversion: 24 },
    { stage: 'Paid', value: 800, conversion: 8 },
    { stage: 'Retained', value: 640, conversion: 6.4 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered insights, predictions, and anomaly detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={selectedTimeRange === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('24h')}
          >
            24h
          </Button>
          <Button 
            variant={selectedTimeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('7d')}
          >
            7d
          </Button>
          <Button 
            variant={selectedTimeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('30d')}
          >
            30d
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="funnels" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Funnels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge variant={getImpactColor(insight.impact)}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
                  </div>
                  <Progress value={insight.confidence * 100} className="h-2" />
                  
                  {insight.actionItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Action Items:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {insight.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {insights.length === 0 && !insightsLoading && (
              <Card className="col-span-full">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No insights yet</h3>
                    <p className="text-muted-foreground">
                      AI insights will appear here as we analyze your data
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{prediction.metric}</CardTitle>
                    {getTrendIcon(prediction.trend)}
                  </div>
                  <CardDescription>{prediction.timeframe}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-2xl font-bold">
                        {typeof prediction.current === 'number' && prediction.current > 1000 
                          ? prediction.current.toLocaleString() 
                          : prediction.current}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Predicted</p>
                      <p className="text-2xl font-bold text-primary">
                        {typeof prediction.predicted === 'number' && prediction.predicted > 1000 
                          ? prediction.predicted.toLocaleString() 
                          : prediction.predicted}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{Math.round(prediction.confidence * 100)}%</span>
                    </div>
                    <Progress value={prediction.confidence * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <div className="space-y-4">
            {anomalies.map((anomaly, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <CardTitle className="text-lg">{anomaly.metric}</CardTitle>
                        <CardDescription>
                          Detected {new Date(anomaly.detectedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{anomaly.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Value</p>
                      <p className="font-medium text-destructive">{anomaly.currentValue}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Min</p>
                      <p className="font-medium">{anomaly.expectedRange[0]}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Max</p>
                      <p className="font-medium">{anomaly.expectedRange[1]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {anomalies.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No anomalies detected</h3>
                    <p className="text-muted-foreground">
                      All metrics are within expected ranges
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="funnels" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey through key stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={funnelData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funnel Performance</CardTitle>
                <CardDescription>Conversion rates by stage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">
                        {stage.conversion}% ({stage.value.toLocaleString()})
                      </span>
                    </div>
                    <Progress value={stage.conversion} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};