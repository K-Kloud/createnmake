import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_KEY) {
      throw new Error('Missing OpenAI API key');
    }

    const { message, chatMode, userContext } = await req.json();
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing chat message:', { message, chatMode, userContext });

    // Enhanced system prompts with website knowledge
    const websiteKnowledge = `
Website: OpenTeknologies (Create2Make)
Features:
- AI-powered image generation with prompts (5 images/month free, more with subscription)
- Custom clothing and accessories marketplace
- Connect with skilled artisans and manufacturers
- Real-time collaboration tools
- Multiple language support (EN, ES, FR, DE, IT, PT, JA, ZH)
- Subscription tiers: Free (5 images), Basic, Pro, Enterprise
- Image editing and inpainting capabilities
- Portfolio showcase for creators
- Quote request system
- User authentication and profiles

Current user status: ${userContext?.isAuthenticated ? 'Authenticated' : 'Guest'}
Current page: ${userContext?.currentPage || '/'}
`;

    const systemPrompt = chatMode === 'manufacturer' 
      ? `You are a helpful manufacturing expert assistant for OpenTeknologies platform. You specialize in custom clothing and accessories manufacturing processes, materials, specifications, and connecting customers with manufacturers.

${websiteKnowledge}

Focus on:
- Manufacturing processes and capabilities
- Material recommendations and specifications
- Production timelines and costs
- Quality control and standards
- How to use the platform to connect with customers
- Portfolio management and showcasing work
- Quote management system

Be specific about the platform features and guide users through the process.`
      : `You are a helpful customer service assistant for OpenTeknologies platform. You help customers with image generation, finding manufacturers, placing orders, account management, and using platform features.

${websiteKnowledge}

Focus on:
- How to generate images with AI prompts
- Subscription plans and image limits
- Finding and connecting with manufacturers
- Using the marketplace and portfolio features
- Account management and authentication
- Image editing and inpainting tools
- Multi-language support
- Troubleshooting common issues

Always be helpful, specific about platform features, and guide users step-by-step. If users need account-specific help, mention they may need to sign in first.`;

    try {
      console.log('Sending request to OpenAI API...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenAI response:', data);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('OpenAI API request error:', error);
      throw new Error(`Error communicating with OpenAI API: ${error.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});