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
    const { prompt, referenceImage, width = 1024, height = 1024 } = await req.json()
    console.log('Received request with params:', { prompt, width, height, hasReferenceImage: !!referenceImage })

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key')
    }

    let response;
    
    if (referenceImage) {
      // For image variations, we need to send as form-data
      const formData = new FormData();
      
      // Convert base64 to blob
      const base64Data = referenceImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      // Append the image file
      formData.append('image', blob, 'image.png');
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
      // For regular image generation, we can use JSON
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
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error}`)
    }

    const result = await response.json()
    console.log('OpenAI API response:', result)

    if (!result.data || !result.data[0] || !result.data[0].url) {
      console.error('Invalid response structure:', result)
      throw new Error('Invalid response from image generation service')
    }

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
    )
  } catch (error) {
    console.error('Error:', error)
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
    )
  }
})