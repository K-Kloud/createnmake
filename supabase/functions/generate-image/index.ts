import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as fal from '@fal-ai/serverless-client'

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

    const result = await fal.run('stable-diffusion-xl', {
      input: {
        prompt,
        image_size: { width, height },
        num_images: 1,
        negative_prompt: "blurry, low quality, distorted",
      },
    });

    console.log('Fal AI response received:', result)

    return new Response(JSON.stringify(result), {
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