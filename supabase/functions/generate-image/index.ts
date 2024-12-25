import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }

    let requestData;
    let referenceImage;

    // Handle both FormData and JSON requests
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      requestData = {
        prompt: formData.get('prompt'),
        width: formData.get('width'),
        height: formData.get('height'),
      };
      referenceImage = formData.get('referenceImage');
    } else {
      requestData = await req.json();
    }

    const { prompt, width = 1024, height = 1024 } = requestData;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Processing request with params:', { prompt, width, height, hasReferenceImage: !!referenceImage });

    let response;
    if (referenceImage) {
      // For image variations
      const formData = new FormData();
      formData.append('image', referenceImage);
      formData.append('n', '1');
      formData.append('size', '1024x1024');

      response = await fetch('https://api.openai.com/v1/images/variations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });
    } else {
      // For text-to-image generation
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      });
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    console.log('OpenAI API response:', result);

    return new Response(
      JSON.stringify({ 
        url: result.data[0].url,
        images: result.data
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});