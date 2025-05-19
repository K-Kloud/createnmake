
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { prompt, width = 1024, height = 1024, referenceImage } = await req.json()
    
    console.log('Generating image with prompt:', prompt)

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Add content filtering and prompt enhancement
    const enhancedPrompt = `Create a professional, safe, and appropriate image of: ${prompt}`;

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Updated API call with explicit dimensions and quality settings
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      // Handle safety system rejections specifically
      if (errorData.error?.message?.includes('safety system')) {
        return new Response(
          JSON.stringify({
            error: "Your prompt was flagged by our safety system. Please try rephrasing it or use different terms.",
            details: errorData.error
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(errorData.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    if (!data?.data?.[0]?.url) {
      throw new Error('No image URL in OpenAI response');
    }

    const imageUrl = data.data[0].url;

    // Fetch the generated image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch generated image');
    }
    const imageBlob = await imageResponse.blob();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Upload to Supabase Storage
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('generated-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Check if storage bucket doesn't exist
      if (uploadError.message?.includes('storage/bucket-not-found')) {
        // Try to create the bucket
        try {
          const { data: bucketData, error: bucketError } = await supabaseClient.storage.createBucket('generated-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          
          if (bucketError) throw bucketError;
          
          // Try upload again after bucket creation
          const { data: retryData, error: retryError } = await supabaseClient.storage
            .from('generated-images')
            .upload(fileName, imageBlob, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: false
            });
            
          if (retryError) throw retryError;
        } catch (bucketOperationError) {
          console.error('Failed to create bucket or retry upload:', bucketOperationError);
          throw new Error('Failed to create storage bucket for images');
        }
      } else {
        throw new Error('Failed to upload generated image');
      }
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('generated-images')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ url: publicUrl, prompt: enhancedPrompt }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in generate-image function:', error);
    
    // Send a properly formatted error response
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.details || null
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
