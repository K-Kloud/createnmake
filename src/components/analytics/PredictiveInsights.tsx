import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Prediction {
  id: number; // Changed from string to number to match database
  prediction_type: string;
  target_metric: string;
  predicted_value: number;
  confidence_interval: any;
  prediction_date: string;
  accuracy_score?: number;
}

export const PredictiveInsights: React.FC = () => {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['predictive-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictive_analytics')
        .select('*')
        .gte('prediction_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Prediction[];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading predictions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          AI Predictions & Forecasting
        </h3>
      </div>

      {!predictions || predictions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No predictions available</h3>
            <p className="text-muted-foreground">
              Predictions will appear as the AI analyzes your platform data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {predictions.map((prediction) => (
            <Card key={prediction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg capitalize">
                      {prediction.prediction_type.replace('_', ' ')} Forecast
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Target: {prediction.target_metric}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {new Date(prediction.prediction_date).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Predicted Value:</span>
                    <span className="text-2xl font-bold text-primary">
                      {typeof prediction.predicted_value === 'number' 
                        ? prediction.predicted_value.toLocaleString()
                        : prediction.predicted_value
                      }
                    </span>
                  </div>
                  
                  {prediction.confidence_interval && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Confidence Range:</span>
                        <span>
                          {prediction.confidence_interval.lower} - {prediction.confidence_interval.upper}
                        </span>
                      </div>
                    </div>
                  )}

                  {prediction.accuracy_score && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Historical Accuracy:</span>
                        <span className="flex items-center gap-2">
                          <Progress value={prediction.accuracy_score} className="w-20" />
                          <span>{prediction.accuracy_score}%</span>
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {prediction.accuracy_score && prediction.accuracy_score > 85 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : prediction.accuracy_score && prediction.accuracy_score > 70 ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        AI Model Prediction
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};