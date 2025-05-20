
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
    const { prompt, itemType, aspectRatio, referenceImageUrl } = await req.json()
    
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

    // Get dimensions from aspect ratio
    let width = 1024;
    let height = 1024;

    if (aspectRatio === 'portrait') {
      width = 1080;
      height = 1350;
    } else if (aspectRatio === 'landscape' || aspectRatio === 'youtube') {
      width = 1920;
      height = 1080;
    } else if (aspectRatio === 'story') {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === 'facebook' || aspectRatio === 'linkedin') {
      width = 1200;
      height = 630;
    } else if (aspectRatio === 'twitter') {
      width = 1600;
      height = 900;
    }

    // Define size based on allowed DALL-E sizes
    const size = width >= height ? "1024x1024" : "1024x1792"; 
    
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
        size: size,
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
      
      return new Response(
        JSON.stringify({ 
          error: errorData.error?.message || 'Failed to generate image',
          details: errorData.error
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
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

    // Check if the bucket exists, create if it doesn't
    try {
      const { data: bucketData, error: bucketCheckError } = await supabaseClient.storage
        .getBucket('generated-images');
      
      if (bucketCheckError && bucketCheckError.message.includes('not found')) {
        // Bucket doesn't exist, create it
        const { data: newBucket, error: createError } = await supabaseClient.storage
          .createBucket('generated-images', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          throw new Error('Failed to create storage bucket');
        }
        
        console.log('Created storage bucket "generated-images"');
      }
    } catch (bucketError) {
      console.error('Error checking/creating bucket:', bucketError);
      // Continue anyway, the upload will fail if the bucket truly doesn't exist
    }

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
      throw new Error(`Failed to upload generated image: ${uploadError.message}`);
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
        details: error.toString()
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
