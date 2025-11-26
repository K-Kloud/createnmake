
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  ai_response?: string;
  sentiment_score?: number;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, message, user_id, ticket_id } = await req.json();

    console.log('AI Customer Support request:', { action, user_id, ticket_id });

    switch (action) {
      case 'analyze_message':
        return await analyzeMessage(message, OPENAI_API_KEY, supabaseClient);
      
      case 'generate_response':
        return await generateResponse(ticket_id, OPENAI_API_KEY, supabaseClient);
      
      case 'categorize_ticket':
        return await categorizeTicket(message, OPENAI_API_KEY);
      
      case 'detect_sentiment':
        return await detectSentiment(message, OPENAI_API_KEY);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('AI Customer Support error:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function analyzeMessage(message: string, apiKey: string, supabase: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze this customer support message and return a JSON response with:
          - category: one of [technical, billing, product, general, complaint, feature_request]
          - priority: one of [low, medium, high, urgent]
          - sentiment: score from -1 (negative) to 1 (positive)
          - urgency_indicators: array of phrases that indicate urgency
          - suggested_actions: array of recommended actions`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const analysis = JSON.parse(data.choices[0].message.content);

  return new Response(
    JSON.stringify({ analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateResponse(ticketId: string, apiKey: string, supabase: any) {
  // Get ticket details
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Get user context
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', ticket.user_id)
    .single();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful customer support AI for a custom clothing design platform. 
          Generate a professional, empathetic response to the customer's inquiry.
          Be helpful, concise, and provide actionable solutions when possible.
          If the issue requires human intervention, suggest escalation.`
        },
        {
          role: 'user',
          content: `Customer message: ${ticket.message}
          Category: ${ticket.category}
          Priority: ${ticket.priority}
          User tier: ${userProfile?.creator_tier || 'free'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  // Update ticket with AI response
  await supabase
    .from('support_tickets')
    .update({ 
      ai_response: aiResponse,
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId);

  return new Response(
    JSON.stringify({ response: aiResponse }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function categorizeTicket(message: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Categorize this support message into one of: technical, billing, product, general, complaint, feature_request. Return only the category name.'
        },
        { role: 'user', content: message }
      ],
      temperature: 0.1,
    }),
  });

  const data = await response.json();
  const category = data.choices[0].message.content.trim().toLowerCase();

  return new Response(
    JSON.stringify({ category }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function detectSentiment(message: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of this message and return a score from -1 (very negative) to 1 (very positive). Return only the numeric score.'
        },
        { role: 'user', content: message }
      ],
      temperature: 0.1,
    }),
  });

  const data = await response.json();
  const sentiment = parseFloat(data.choices[0].message.content.trim());

  return new Response(
    JSON.stringify({ sentiment }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
