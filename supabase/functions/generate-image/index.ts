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
    console.log('Received request with params:', { prompt, width, height })

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    const FAL_KEY = Deno.env.get('Fal_Api_Key')
    if (!FAL_KEY) {
      throw new Error('Missing Fal API key')
    }

    // Make request to Fal AI API
    const response = await fetch('https://api.fal.ai/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${FAL_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        model: 'fal-ai/fast-sdxl',
        width,
        height,
        num_images: 1,
        negative_prompt: "blurry, low quality, distorted",
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Fal AI API error:', error)
      throw new Error(`Fal AI API error: ${error}`)
    }

    const result = await response.json()
    console.log('Fal AI API response:', result)

    if (!result.images || !result.images[0] || !result.images[0].url) {
      console.error('Invalid response structure:', result)
      throw new Error('Invalid response from image generation service')
    }

    return new Response(
      JSON.stringify({ 
        url: result.images[0].url,
        seed: result.seed,
        images: result.images
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