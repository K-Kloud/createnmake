import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { service, endpoint, method, data } = await req.json();

    // Get Go service URL
    const goServiceUrl = Deno.env.get('GO_PERFORMANCE_SERVICE_URL') || 'http://go-performance-service:8002';

    // Forward request to Go performance service
    const response = await fetch(`${goServiceUrl}${endpoint}`, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    // Performance metrics logging
    const startTime = Date.now();
    const responseTime = Date.now() - startTime;
    
    console.log(`Performance Gateway: ${endpoint} - Response time: ${responseTime}ms`);

    return new Response(
      JSON.stringify({
        ...result,
        _gateway_metrics: {
          response_time_ms: responseTime,
          service: 'go-performance',
          endpoint
        }
      }),
      { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Performance Gateway error:', error);
    return new Response(
      JSON.stringify({ error: 'Performance service unavailable' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})