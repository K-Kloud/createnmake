import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    const response = await fetch('https://api.fal.ai/v1/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model: 'stable-diffusion-xl',
        height,
        width,
        num_images: 1,
        negative_prompt: "blurry, low quality, distorted",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Fal AI API error:', errorText)
      throw new Error(`Fal AI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Fal AI response received:', data)

    return new Response(JSON.stringify(data), {
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