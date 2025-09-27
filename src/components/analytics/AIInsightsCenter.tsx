import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AIInsight {
  id: number; // Changed to match database
  insight_type: string;
  title: string;
  content: string;
  confidence_score: number;
  impact_level: 'low' | 'medium' | 'high';
  recommendations: any[];
  created_at: string;
}

export const AIInsightsCenter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('ai-insights-generator', {
        body: { timeRange: '30d', analysisType: 'comprehensive' }
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      refetch();
    }
  });

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true);
    try {
      await generateInsightsMutation.mutateAsync();
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const filteredInsights = insights?.filter(insight => 
    selectedCategory === 'all' || insight.insight_type === selectedCategory
  ) || [];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'optimization': return Target;
      default: return Brain;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading AI insights...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Insights Center</h2>
          <p className="text-muted-foreground">AI-powered analytics and recommendations</p>
        </div>
        <Button 
          onClick={handleGenerateInsights} 
          disabled={generatingInsights}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {generatingInsights ? 'Generating...' : 'Generate New Insights'}
        </Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All Insights</TabsTrigger>
          <TabsTrigger value="trend">Trends</TabsTrigger>
          <TabsTrigger value="anomaly">Anomalies</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="prediction">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredInsights.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No insights available</h3>
                <p className="text-muted-foreground mb-4">
                  Generate AI insights to get recommendations and analysis.
                </p>
                <Button onClick={handleGenerateInsights} disabled={generatingInsights}>
                  Generate Insights
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredInsights.map((insight) => {
                const IconComponent = getInsightIcon(insight.insight_type);
                return (
                  <Card key={insight.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getImpactColor(insight.impact_level) as any}>
                                {insight.impact_level} impact
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <span>Confidence:</span>
                                <Progress value={insight.confidence_score} className="w-16" />
                                <span>{insight.confidence_score}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{insight.content}</p>
                      
                      {insight.recommendations && Array.isArray(insight.recommendations) && insight.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Recommendations:</h4>
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec: any, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{typeof rec === 'string' ? rec : rec.text || rec.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};