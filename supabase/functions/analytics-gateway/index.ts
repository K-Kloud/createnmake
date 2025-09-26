import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { timeRange, metrics, userId } = await req.json();

    // Multi-source analytics aggregation
    const analyticsPromises = [];

    // Database analytics
    if (metrics.includes('user_activity')) {
      analyticsPromises.push(
        supabaseClient
          .from('activity_metrics')
          .select('*')
          .eq('user_id', userId)
          .gte('recorded_at', new Date(Date.now() - getTimeRangeMs(timeRange)).toISOString())
      );
    }

    // AI agent analytics
    if (metrics.includes('ai_performance')) {
      analyticsPromises.push(
        supabaseClient
          .from('ai_agent_metrics')
          .select('*')
          .gte('recorded_at', new Date(Date.now() - getTimeRangeMs(timeRange)).toISOString())
      );
    }

    // External service analytics (Python ML service)
    if (metrics.includes('ml_usage')) {
      const mlServiceUrl = Deno.env.get('PYTHON_ML_SERVICE_URL') || 'http://python-ml-service:8001';
      analyticsPromises.push(
        fetch(`${mlServiceUrl}/analytics?user_id=${userId}&time_range=${timeRange}`)
          .then(res => res.json())
          .catch(() => ({ data: [], error: 'ML service unavailable' }))
      );
    }

    const results = await Promise.allSettled(analyticsPromises);
    
    const analytics = {
      timeRange,
      generatedAt: new Date().toISOString(),
      data: results.map((result, index) => ({
        metric: metrics[index],
        status: result.status,
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }))
    };

    return new Response(
      JSON.stringify(analytics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analytics Gateway error:', error);
    return new Response(
      JSON.stringify({ error: 'Analytics service error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

function getTimeRangeMs(timeRange: string): number {
  const ranges: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };
  return ranges[timeRange] || ranges['24h'];
}