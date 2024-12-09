import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { fal } from "npm:@fal-ai/client"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    console.log('Generating image with prompt:', prompt)
    console.log('Image dimensions:', width, 'x', height)

    // Initialize the Fal AI client
    fal.config({ credentials: FAL_KEY });

    const result = await fal.subscribe("fal-ai/fast-sdxl", {
      input: {
        prompt,
        image_size: { width, height },
        num_images: 1,
        negative_prompt: "blurry, low quality, distorted",
        num_inference_steps: 28,
        guidance_scale: 7.5,
        enable_safety_checker: true
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('Generation progress:', update.logs);
        }
      },
    });

    console.log('Fal AI response:', result);

    if (!result.images?.[0]?.url) {
      throw new Error('No image URL in response from Fal AI');
    }

    return new Response(JSON.stringify({
      url: result.images[0].url,
      seed: result.seed,
      images: result.images
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})