import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { fal } from "npm:@fal-ai/client"

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
    const FAL_KEY = Deno.env.get('Fal_Api_Key')
    if (!FAL_KEY) {
      throw new Error('Missing Fal API key')
    }

    const { prompt, width = 1024, height = 1024 } = await req.json()
    if (!prompt) {
      throw new Error('Prompt is required')
    }

    console.log('Received request with params:', { prompt, width, height })

    // Initialize the Fal AI client
    fal.config({ credentials: FAL_KEY })

    console.log('Making request to Fal AI...')
    const result = await fal.subscribe("fal-ai/fast-sdxl", {
      input: {
        prompt,
        width: Number(width),
        height: Number(height),
        num_images: 1,
        negative_prompt: "blurry, low quality, distorted",
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('Generation progress:', update.logs)
        }
      },
    })

    console.log('Raw Fal AI response:', result)

    // Validate the response structure
    if (!result || !result.images || !Array.isArray(result.images) || result.images.length === 0) {
      console.error('Invalid response structure:', result)
      throw new Error('Invalid response from image generation service')
    }

    const image = result.images[0]
    if (!image || !image.url) {
      console.error('No valid image URL in response:', image)
      throw new Error('No valid image URL in response')
    }

    return new Response(
      JSON.stringify({
        url: image.url,
        seed: result.seed,
        images: result.images
      }), 
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    )
  } catch (error) {
    console.error('Error details:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})