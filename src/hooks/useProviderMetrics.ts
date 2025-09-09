import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MetricData {
  provider: string;
  provider_version?: string;
  metric_type: 'generation_time' | 'success_rate' | 'quality_score' | 'user_satisfaction';
  metric_value: number;
  metadata?: Record<string, any>;
}

export interface ProviderStats {
  successRate: number;
  averageTime: number;
  totalGenerations: number;
  recentPerformance: 'excellent' | 'good' | 'fair' | 'poor';
}

interface LocalMetric {
  provider: string;
  generationTime: number;
  success: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'local_provider_metrics';
const MAX_METRICS = 50;

export const useProviderMetrics = () => {
  const { session } = useAuth();
  
  const [localMetrics, setLocalMetrics] = useState<LocalMetric[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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
    const generationTime = endTime - startTime; // milliseconds for local storage
    
    // Record to database
    recordMetric({
      provider,
      metric_type: 'generation_time',
      metric_value: duration,
      metadata: { success, timestamp: endTime }
    });
    
    recordMetric({
      provider,
      metric_type: 'success_rate',
      metric_value: success ? 1 : 0,
      metadata: { duration, timestamp: endTime }
    });
    
    // Record to local storage for analytics
    const newMetric: LocalMetric = {
      provider,
      generationTime,
      success,
      timestamp: endTime
    };
    
    setLocalMetrics(prev => {
      const updated = [newMetric, ...prev].slice(0, MAX_METRICS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getProviderStats = useCallback((provider: string): ProviderStats => {
    const providerMetrics = localMetrics.filter(m => m.provider === provider);
    
    if (providerMetrics.length === 0) {
      return {
        successRate: 0,
        averageTime: 0,
        totalGenerations: 0,
        recentPerformance: 'fair'
      };
    }

    const recentMetrics = providerMetrics.slice(0, 10);
    const successfulMetrics = recentMetrics.filter(m => m.success);
    
    const successRate = (successfulMetrics.length / recentMetrics.length) * 100;
    const averageTime = successfulMetrics.length > 0 
      ? successfulMetrics.reduce((sum, m) => sum + m.generationTime, 0) / successfulMetrics.length
      : 0;

    let recentPerformance: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
    if (successRate >= 90 && averageTime <= 15000) recentPerformance = 'excellent';
    else if (successRate >= 75 && averageTime <= 25000) recentPerformance = 'good';
    else if (successRate >= 50) recentPerformance = 'fair';
    else recentPerformance = 'poor';

    return {
      successRate,
      averageTime,
      totalGenerations: providerMetrics.length,
      recentPerformance
    };
  }, [localMetrics]);

  const getBestPerformingProvider = useCallback((providers: string[]): string => {
    let bestProvider = providers[0];
    let bestScore = 0;

    providers.forEach(provider => {
      const stats = getProviderStats(provider);
      const speedScore = Math.max(0, 100 - (stats.averageTime / 1000 * 2));
      const score = stats.successRate * 0.7 + speedScore * 0.3;
      
      if (score > bestScore) {
        bestScore = score;
        bestProvider = provider;
      }
    });

    return bestProvider;
  }, [getProviderStats]);

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
    recordMetric,
    getProviderStats,
    getBestPerformingProvider,
    localMetrics
  };
};