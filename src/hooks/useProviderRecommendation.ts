import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProviderMetrics {
  provider: string;
  provider_version?: string;
  avg_generation_time: number;
  success_rate: number;
  quality_score: number;
  total_generations: number;
}

interface ProviderRecommendation {
  provider: string;
  score: number;
  reason: string;
  metrics?: ProviderMetrics;
}

export const useProviderRecommendation = (itemType?: string, aspectRatio?: string) => {
  const [recommendation, setRecommendation] = useState<ProviderRecommendation | null>(null);
  const [allMetrics, setAllMetrics] = useState<ProviderMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderMetrics = async () => {
      try {
        setLoading(true);
        
        // Fetch provider performance metrics from the database
        const { data: metricsData, error } = await supabase
          .from('provider_metrics')
          .select('*')
          .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

        if (error) {
          console.error('Error fetching provider metrics:', error);
          return;
        }

        // Process metrics data
        const processedMetrics = processMetricsData(metricsData || []);
        setAllMetrics(processedMetrics);
        
        // Generate recommendation
        const recommended = generateRecommendation(processedMetrics, itemType, aspectRatio);
        setRecommendation(recommended);
        
      } catch (error) {
        console.error('Error in provider recommendation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderMetrics();
  }, [itemType, aspectRatio]);

  return {
    recommendation,
    allMetrics,
    loading,
    refreshMetrics: () => {
      const fetchMetrics = async () => {
        setLoading(true);
        // Refetch logic here
        setLoading(false);
      };
      fetchMetrics();
    }
  };
};

function processMetricsData(rawMetrics: any[]): ProviderMetrics[] {
  const groupedMetrics = rawMetrics.reduce((acc, metric) => {
    const key = `${metric.provider}_${metric.provider_version || 'default'}`;
    if (!acc[key]) {
      acc[key] = {
        provider: metric.provider,
        provider_version: metric.provider_version,
        generation_times: [],
        success_count: 0,
        total_count: 0,
        quality_scores: []
      };
    }
    
    acc[key].total_count += 1;
    
    if (metric.metric_type === 'generation_time') {
      acc[key].generation_times.push(metric.metric_value);
    } else if (metric.metric_type === 'success_rate') {
      if (metric.metric_value === 1) acc[key].success_count += 1;
    } else if (metric.metric_type === 'quality_score') {
      acc[key].quality_scores.push(metric.metric_value);
    }
    
    return acc;
  }, {});

  return Object.values(groupedMetrics).map((group: any) => ({
    provider: group.provider,
    provider_version: group.provider_version,
    avg_generation_time: group.generation_times.length > 0 
      ? group.generation_times.reduce((a: number, b: number) => a + b, 0) / group.generation_times.length 
      : 0,
    success_rate: group.total_count > 0 ? group.success_count / group.total_count : 0,
    quality_score: group.quality_scores.length > 0
      ? group.quality_scores.reduce((a: number, b: number) => a + b, 0) / group.quality_scores.length
      : 0,
    total_generations: group.total_count
  }));
}

function generateRecommendation(
  metrics: ProviderMetrics[], 
  itemType?: string, 
  aspectRatio?: string
): ProviderRecommendation {
  
  // Default recommendations based on use case
  const defaultRecommendations = {
    // High quality fashion items
    'little-black-dress-lbd': { provider: 'openai', reason: 'Best for detailed fashion photography' },
    'trench-coat-classic-beige': { provider: 'openai', reason: 'Excellent fabric texture rendering' },
    
    // Nigerian traditional wear
    'ankara-print-jumpsuit': { provider: 'gemini', reason: 'Great for cultural and pattern recognition' },
    'mens-senator-wear-kaftan': { provider: 'gemini', reason: 'Strong cultural context understanding' },
    
    // Creative and unique styles
    'crop-top': { provider: 'xai', reason: 'Innovative styling and creative interpretations' },
    'tank-top': { provider: 'xai', reason: 'Fresh perspectives on casual wear' },
  };

  // Check if we have a specific recommendation for this item type
  if (itemType && defaultRecommendations[itemType as keyof typeof defaultRecommendations]) {
    const defaultRec = defaultRecommendations[itemType as keyof typeof defaultRecommendations];
    return {
      provider: defaultRec.provider,
      score: 85,
      reason: defaultRec.reason
    };
  }

  // Use metrics-based recommendation if available
  if (metrics.length > 0) {
    const bestProvider = metrics.reduce((best, current) => {
      // Calculate composite score: success_rate (40%) + quality (35%) + speed (25%)
      const currentScore = (current.success_rate * 0.4) + 
                          (current.quality_score * 0.35) + 
                          ((1 / Math.max(current.avg_generation_time, 1)) * 0.25);
      
      const bestScore = (best.success_rate * 0.4) + 
                       (best.quality_score * 0.35) + 
                       ((1 / Math.max(best.avg_generation_time, 1)) * 0.25);
      
      return currentScore > bestScore ? current : best;
    });

    return {
      provider: bestProvider.provider,
      score: Math.round((bestProvider.success_rate * 0.4 + bestProvider.quality_score * 0.35) * 100),
      reason: `${Math.round(bestProvider.success_rate * 100)}% success rate, ${bestProvider.avg_generation_time.toFixed(1)}s avg time`,
      metrics: bestProvider
    };
  }

  // Fallback recommendations based on aspect ratio and general use cases
  if (aspectRatio === 'portrait' || aspectRatio === 'story') {
    return {
      provider: 'openai',
      score: 80,
      reason: 'Excellent for portrait orientation and detailed subjects'
    };
  }

  if (aspectRatio === 'landscape' || aspectRatio === 'youtube') {
    return {
      provider: 'xai',
      score: 78,
      reason: 'Great for wide compositions and creative scenes'
    };
  }

  // Default recommendation
  return {
    provider: 'openai',
    score: 75,
    reason: 'Reliable choice with consistent quality'
  };
}