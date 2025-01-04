import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, width = 1024, height = 1024 } = await req.json()
    
    console.log('Generating image with prompt:', prompt)

    // Add content filtering and prompt enhancement
    const enhancedPrompt = `Create a professional, safe, and appropriate image of: ${prompt}`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      
      // Handle safety system rejections specifically
      if (error.error?.message?.includes('safety system')) {
        return new Response(
          JSON.stringify({
            error: "Your prompt was flagged by our safety system. Please try rephrasing it or use different terms.",
            details: error.error
          }),
          { 
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    return new Response(
      JSON.stringify({ url: imageUrl, prompt: enhancedPrompt }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in generate-image function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || null
      }),
      { 
        status: error.status || 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})