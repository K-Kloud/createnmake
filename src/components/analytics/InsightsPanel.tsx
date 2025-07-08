import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { LoadingState } from '@/components/ui/loading-state';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  CheckCircle,
  Clock,
  Brain
} from 'lucide-react';

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'trend':
      return <TrendingUp className="h-4 w-4" />;
    case 'anomaly':
      return <AlertTriangle className="h-4 w-4" />;
    case 'recommendation':
      return <Lightbulb className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
  }
};

const getInsightColor = (type: string) => {
  switch (type) {
    case 'trend':
      return 'text-blue-600';
    case 'anomaly':
      return 'text-yellow-600';
    case 'recommendation':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

const getConfidenceColor = (score: number) => {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};

const getConfidenceBadge = (score: number) => {
  if (score >= 0.8) return 'High';
  if (score >= 0.6) return 'Medium';
  return 'Low';
};

export const InsightsPanel: React.FC = () => {
  const { useAnalyticsInsights } = useAdvancedAnalytics();
  const { data: insights, isLoading, error } = useAnalyticsInsights();

  const acknowledgeInsight = async (insightId: string) => {
    // This would typically update the insight status
    console.log('Acknowledging insight:', insightId);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingState
          isLoading={isLoading}
          error={error}
          loadingMessage="Generating insights..."
          errorMessage="Failed to load insights"
        >
          {insights && insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={getInsightColor(insight.insight_type)}>
                          {getInsightIcon(insight.insight_type)}
                        </div>
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge variant="outline" className="capitalize">
                          {insight.insight_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={insight.confidence_score >= 0.8 ? 'default' : 'secondary'}
                          className={getConfidenceColor(insight.confidence_score)}
                        >
                          {getConfidenceBadge(insight.confidence_score)} Confidence
                        </Badge>
                        {!insight.is_acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => acknowledgeInsight(insight.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    
                    {insight.action_items && insight.action_items.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Recommended Actions:
                        </h4>
                        <ul className="space-y-1">
                          {insight.action_items.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(insight.time_period_start).toLocaleDateString()} - 
                        {new Date(insight.time_period_end).toLocaleDateString()}
                      </div>
                      <div>
                        Source: {insight.data_source}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
              <p className="text-muted-foreground">
                AI insights will appear here as your app gathers more data and usage patterns.
              </p>
            </div>
          )}
        </LoadingState>
      </CardContent>
    </Card>
  );
};