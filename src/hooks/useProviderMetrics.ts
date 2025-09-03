import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MetricData {
  provider: string;
  provider_version?: string;
  metric_type: 'generation_time' | 'success_rate' | 'quality_score' | 'user_satisfaction';
  metric_value: number;
  metadata?: Record<string, any>;
}

export const useProviderMetrics = () => {
  const { session } = useAuth();

  const recordMetric = async (data: MetricData) => {
    try {
      const { error } = await supabase
        .from('provider_metrics')
        .insert({
          provider: data.provider,
          provider_version: data.provider_version,
          metric_type: data.metric_type,
          metric_value: data.metric_value,
          metadata: data.metadata || {}
        });

      if (error) {
        console.error('Error recording provider metric:', error);
      }
    } catch (error) {
      console.error('Failed to record provider metric:', error);
    }
  };

  const recordGenerationTime = (provider: string, startTime: number, endTime: number, success: boolean) => {
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    
    // Record generation time
    recordMetric({
      provider,
      metric_type: 'generation_time',
      metric_value: duration,
      metadata: { success, timestamp: endTime }
    });
    
    // Record success/failure
    recordMetric({
      provider,
      metric_type: 'success_rate',
      metric_value: success ? 1 : 0,
      metadata: { duration, timestamp: endTime }
    });
  };

  const recordQualityScore = (provider: string, score: number, imageId?: number) => {
    recordMetric({
      provider,
      metric_type: 'quality_score',
      metric_value: score,
      metadata: { imageId, timestamp: Date.now() }
    });
  };

  const recordUserSatisfaction = (provider: string, rating: number, imageId?: number) => {
    recordMetric({
      provider,
      metric_type: 'user_satisfaction',
      metric_value: rating,
      metadata: { imageId, timestamp: Date.now() }
    });
  };

  return {
    recordGenerationTime,
    recordQualityScore,
    recordUserSatisfaction,
    recordMetric
  };
};