
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

    // Enhanced content filtering and prompt optimization
    const sanitizedPrompt = sanitizePrompt(prompt);
    if (!sanitizedPrompt) {
      return new Response(
        JSON.stringify({ 
          error: "Your prompt contains content that cannot be processed. Please try rephrasing with different terms.",
          details: "Content policy violation detected"
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create professional, detailed prompt based on item type
    const enhancedPrompt = createEnhancedPrompt(sanitizedPrompt, itemType);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Get dimensions from aspect ratio
    const size = getDimensionsFromAspectRatio(aspectRatio);

    console.log('Using enhanced prompt:', enhancedPrompt);
    console.log('Image size:', size);

    // Call OpenAI API with retry logic
    const response = await callOpenAIWithRetry(OPENAI_API_KEY, enhancedPrompt, size);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      return handleOpenAIError(errorData);
    }

    const data = await response.json();
    if (!data?.data?.[0]?.url) {
      throw new Error('No image URL in OpenAI response');
    }

    const imageUrl = data.data[0].url;

    // Process and store the image
    const publicUrl = await processAndStoreImage(imageUrl);

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

function sanitizePrompt(prompt: string): string | null {
  // Remove potentially problematic content
  const blockedTerms = [
    'nude', 'naked', 'nsfw', 'sexual', 'explicit', 'pornographic',
    'violence', 'weapon', 'gun', 'knife', 'blood', 'gore',
    'drugs', 'illegal', 'harmful', 'dangerous'
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  for (const term of blockedTerms) {
    if (lowerPrompt.includes(term)) {
      return null;
    }
  }
  
  // Clean up the prompt
  return prompt
    .replace(/[^\w\s\-.,!?]/g, ' ') // Remove special chars except basic punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 1000); // Limit length
}

function createEnhancedPrompt(prompt: string, itemType: string): string {
  const itemTypePrompts = {
    'tops': 'fashion clothing top, shirt, blouse, or sweater',
    'bottoms': 'fashion clothing bottom, pants, jeans, or skirt',
    'dresses': 'elegant dress or gown',
    'outerwear': 'jacket, coat, or outerwear garment',
    'accessories': 'fashion accessory item',
    'shoes': 'footwear, shoes, boots, or sandals',
    'suits': 'formal suit or business attire',
    'activewear': 'athletic wear or sportswear'
  };

  const baseType = itemTypePrompts[itemType] || 'clothing item';
  
  return `Create a professional, high-quality studio photograph of a ${baseType}: ${prompt}. 
Studio lighting, clean white background, detailed fabric texture, commercial product photography style, 
professional fashion photography, crisp details, high resolution, appropriate for e-commerce.`;
}

function getDimensionsFromAspectRatio(aspectRatio: string): string {
  switch (aspectRatio) {
    case 'portrait':
      return "1024x1792";
    case 'landscape':
    case 'youtube':
      return "1792x1024";
    case 'story':
      return "1024x1792";
    case 'facebook':
    case 'linkedin':
    case 'twitter':
      return "1024x1024";
    default:
      return "1024x1024";
  }
}

async function callOpenAIWithRetry(apiKey: string, prompt: string, size: string, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: size,
          quality: "standard",
          response_format: "url"
        }),
      });

      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  
  throw new Error('Failed to call OpenAI API after retries');
}

function handleOpenAIError(errorData: any): Response {
  let errorMessage = "Failed to generate image";
  let statusCode = 500;

  if (errorData.error) {
    const error = errorData.error;
    
    if (error.type === 'image_generation_user_error' || 
        error.message?.includes('safety') || 
        error.message?.includes('policy')) {
      errorMessage = "Your prompt was flagged by our safety system. Please try rephrasing it with different, more appropriate terms.";
      statusCode = 400;
    } else if (error.type === 'invalid_request_error') {
      errorMessage = "Invalid request. Please check your prompt and try again.";
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
  }

  return new Response(
    JSON.stringify({
      error: errorMessage,
      details: errorData.error,
      suggestions: [
        "Try using more specific, descriptive terms",
        "Avoid potentially sensitive content",
        "Focus on clothing, style, and fashion elements",
        "Use professional fashion terminology"
      ]
    }),
    { 
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function processAndStoreImage(imageUrl: string): Promise<string> {
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

  // Ensure bucket exists
  await ensureBucketExists(supabaseClient);

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

  return publicUrl;
}

async function ensureBucketExists(supabaseClient: any) {
  try {
    const { data: bucketData, error: bucketCheckError } = await supabaseClient.storage
      .getBucket('generated-images');
    
    if (bucketCheckError && bucketCheckError.message.includes('not found')) {
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
}
