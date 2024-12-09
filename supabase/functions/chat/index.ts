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
    const XAI_KEY = Deno.env.get('Xai_Api_Key')
    if (!XAI_KEY) {
      throw new Error('Missing XAI API key')
    }

    const { message, chatMode } = await req.json()
    if (!message) {
      throw new Error('Message is required')
    }

    console.log('Processing chat message:', { message, chatMode })

    // Customize the system prompt based on chat mode
    const systemPrompt = chatMode === 'manufacturer' 
      ? "You are a helpful manufacturing expert assistant."
      : "You are a helpful customer service representative.";

    try {
      console.log('Sending request to XAI API...')
      
      const response = await fetch('https://api.xai-foundation.org/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XAI_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 500
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('XAI API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(`XAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('XAI response:', data)

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('XAI API request error:', error)
      throw new Error(`Error communicating with XAI API: ${error.message}`)
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})