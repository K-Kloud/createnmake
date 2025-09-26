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
    const { service, endpoint, method, data } = await req.json();

    // Validate request
    if (!service || !endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing service or endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get service URL based on environment
    const serviceUrls = {
      'python-ml': Deno.env.get('PYTHON_ML_SERVICE_URL') || 'http://python-ml-service:8001',
      'go-performance': Deno.env.get('GO_PERFORMANCE_SERVICE_URL') || 'http://go-performance-service:8002',
      'node-realtime': Deno.env.get('NODE_REALTIME_SERVICE_URL') || 'http://node-realtime-service:8003'
    };

    const serviceUrl = serviceUrls[service as keyof typeof serviceUrls];
    if (!serviceUrl) {
      return new Response(
        JSON.stringify({ error: 'Invalid service' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward request to microservice
    const response = await fetch(`${serviceUrl}${endpoint}`, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    // Log successful requests
    console.log(`Gateway: ${service}${endpoint} - Status: ${response.status}`);

    return new Response(
      JSON.stringify(result),
      { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Gateway error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})