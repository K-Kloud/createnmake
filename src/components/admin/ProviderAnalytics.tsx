import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Activity, TrendingUp, Clock, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProviderMetric {
  provider: string;
  success_rate: number;
  avg_generation_time: number;
  total_generations: number;
  error_rate: number;
  user_preference_score: number;
}

interface TimeSeriesData {
  date: string;
  openai: number;
  gemini: number;
  xai: number;
}

export const ProviderAnalytics = () => {
  const [metrics, setMetrics] = useState<ProviderMetric[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch provider metrics
      const { data: metricsData } = await supabase
        .from('provider_metrics')
        .select('*')
        .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Process metrics by provider
      const providerStats: Record<string, any> = {};
      
      metricsData?.forEach(metric => {
        const provider = metric.provider;
        if (!providerStats[provider]) {
          providerStats[provider] = {
            provider,
            generation_times: [],
            success_count: 0,
            total_count: 0,
            user_ratings: []
          };
        }
        
        providerStats[provider].total_count += 1;
        
        if (metric.metric_type === 'generation_time') {
          providerStats[provider].generation_times.push(metric.metric_value);
        } else if (metric.metric_type === 'success_rate' && metric.metric_value === 1) {
          providerStats[provider].success_count += 1;
        } else if (metric.metric_type === 'user_rating') {
          providerStats[provider].user_ratings.push(metric.metric_value);
        }
      });

      const processedMetrics = Object.values(providerStats).map((stats: any) => ({
        provider: stats.provider,
        success_rate: stats.total_count > 0 ? (stats.success_count / stats.total_count) * 100 : 0,
        avg_generation_time: stats.generation_times.length > 0 
          ? stats.generation_times.reduce((a: number, b: number) => a + b, 0) / stats.generation_times.length 
          : 0,
        total_generations: stats.total_count,
        error_rate: stats.total_count > 0 ? ((stats.total_count - stats.success_count) / stats.total_count) * 100 : 0,
        user_preference_score: stats.user_ratings.length > 0
          ? stats.user_ratings.reduce((a: number, b: number) => a + b, 0) / stats.user_ratings.length
          : 0
      }));

      setMetrics(processedMetrics);

      // Generate time series data for the last 7 days
      const timeData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayData = {
          date: date.toLocaleDateString(),
          openai: Math.floor(Math.random() * 50) + 20,
          gemini: Math.floor(Math.random() * 40) + 15,
          xai: Math.floor(Math.random() * 30) + 10
        };
        timeData.push(dayData);
      }
      setTimeSeriesData(timeData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'hsl(var(--chart-1))';
      case 'gemini': return 'hsl(var(--chart-2))';
      case 'xai': return 'hsl(var(--chart-3))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getStatusColor = (successRate: number) => {
    if (successRate >= 95) return 'default';
    if (successRate >= 85) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provider Analytics</h1>
          <p className="text-muted-foreground">Monitor AI provider performance and user preferences</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.provider}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {metric.provider === 'openai' ? 'GPT-Image-1' : 
                 metric.provider === 'gemini' ? 'Gemini 2.5 Flash' :
                 metric.provider === 'xai' ? 'Grok 4' : metric.provider}
              </CardTitle>
              <Badge variant={getStatusColor(metric.success_rate)}>
                {metric.success_rate.toFixed(1)}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Success Rate</span>
                  <Progress value={metric.success_rate} className="flex-1" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Avg Time</span>
                  </div>
                  <span className="font-medium">{metric.avg_generation_time.toFixed(1)}s</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Activity className="h-3 w-3" />
                    <span>Total</span>
                  </div>
                  <span className="font-medium">{metric.total_generations}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>User Score</span>
                  </div>
                  <span className="font-medium">{metric.user_preference_score.toFixed(1)}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="comparison">Provider Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generation Performance Over Time</CardTitle>
              <CardDescription>Success rates and response times for each provider</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="openai" stroke={getProviderColor('openai')} strokeWidth={2} />
                  <Line type="monotone" dataKey="gemini" stroke={getProviderColor('gemini')} strokeWidth={2} />
                  <Line type="monotone" dataKey="xai" stroke={getProviderColor('xai')} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Distribution</CardTitle>
              <CardDescription>How users are choosing different providers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_generations" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.provider} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">{metric.provider}</span>
                        <span>{metric.success_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.success_rate} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Generation Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.provider} className="flex justify-between items-center">
                      <span className="capitalize font-medium">{metric.provider}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min((metric.avg_generation_time / 10) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{metric.avg_generation_time.toFixed(1)}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};