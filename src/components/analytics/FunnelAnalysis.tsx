import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { LoadingState } from '@/components/ui/loading-state';
import { TrendingDown, TrendingUp, Users, ArrowDown } from 'lucide-react';

interface FunnelAnalysisProps {
  funnelName?: string;
}

export const FunnelAnalysis: React.FC<FunnelAnalysisProps> = ({ 
  funnelName = 'user_onboarding' 
}) => {
  const { useFunnelAnalysis } = useAdvancedAnalytics();
  const { data: funnelData, isLoading, error } = useFunnelAnalysis(funnelName);

  const getConversionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConversionIcon = (rate: number, previousRate?: number) => {
    if (!previousRate) return <Users className="h-4 w-4" />;
    if (rate > previousRate) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Conversion Funnel Analysis
          </CardTitle>
          <Select defaultValue={funnelName}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select funnel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user_onboarding">User Onboarding</SelectItem>
              <SelectItem value="image_generation">Image Generation</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="marketplace_purchase">Marketplace Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <LoadingState
          isLoading={isLoading}
          error={error}
          loadingMessage="Loading funnel analysis..."
          errorMessage="Failed to load funnel data"
        >
          {funnelData && (
            <div className="space-y-6">
              {/* Funnel Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Total Entries</div>
                    <div className="text-2xl font-bold">
                      {funnelData.stats[0]?.total_users || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Final Conversion</div>
                    <div className="text-2xl font-bold">
                      {funnelData.stats[funnelData.stats.length - 1]?.total_users || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Overall Rate</div>
                    <div className="text-2xl font-bold">
                      {funnelData.stats.length > 0 
                        ? Math.round(
                            ((funnelData.stats[funnelData.stats.length - 1]?.total_users || 0) / 
                             (funnelData.stats[0]?.total_users || 1)) * 100
                          )
                        : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Funnel Steps Visualization */}
              <div className="space-y-4">
                {funnelData.stats.map((step, index) => {
                  const previousStep = index > 0 ? funnelData.stats[index - 1] : null;
                  const conversionRate = step.conversion_rate || 100;
                  
                  return (
                    <div key={step.step} className="relative">
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {getConversionIcon(conversionRate, previousStep?.conversion_rate)}
                            <span className="font-medium">{step.step}</span>
                          </div>
                          <Badge variant="outline">
                            Step {step.step_order}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Users</div>
                            <div className="text-lg font-semibold">{step.total_users}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Conversion</div>
                            <div className={`text-lg font-semibold ${getConversionColor(conversionRate)}`}>
                              {Math.round(conversionRate)}%
                            </div>
                          </div>
                          
                          {index < funnelData.stats.length - 1 && (
                            <div className="text-muted-foreground">
                              <ArrowDown className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Drop-off indicator */}
                      {previousStep && conversionRate < 90 && (
                        <div className="absolute -bottom-2 left-4 right-4">
                          <div className="h-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full opacity-60" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Optimization Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Optimization Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {funnelData.stats
                      .filter(step => step.conversion_rate < 70)
                      .map((step, index) => (
                        <div key={step.step} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="font-medium text-yellow-800 dark:text-yellow-200">
                            Improve "{step.step}" conversion
                          </div>
                          <div className="text-sm text-yellow-700 dark:text-yellow-300">
                            Current rate: {Math.round(step.conversion_rate)}% - Consider A/B testing different approaches
                          </div>
                        </div>
                      ))
                    }
                    {funnelData.stats.every(step => step.conversion_rate >= 70) && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="font-medium text-green-800 dark:text-green-200">
                          Great funnel performance!
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          All steps are performing well. Focus on increasing top-of-funnel traffic.
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </LoadingState>
      </CardContent>
    </Card>
  );
};