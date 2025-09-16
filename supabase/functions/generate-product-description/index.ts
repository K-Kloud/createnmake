import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, productType, price, creator } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert copywriter specializing in e-commerce product descriptions. Create compelling, detailed product descriptions that convert browsers into buyers. 

Focus on:
- Highlighting unique features and benefits
- Creating emotional connection with buyers
- Using persuasive language that drives sales
- Mentioning quality, craftsmanship, and value
- Making the product sound desirable and exclusive
- Keep it under 200 words but make every word count

The product is a custom design/artwork piece available for purchase in the marketplace.`;

    const userPrompt = `Create an attractive product description for this custom design:

Original prompt: "${prompt}"
Product type: ${productType || 'Custom Design'}
Price: $${price || 'N/A'}
Creator: ${creator || 'Anonymous Artist'}

Make this sound irresistible to potential buyers while being authentic to the original concept.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedDescription = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      description: generatedDescription,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-product-description function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});