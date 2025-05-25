
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
    
    console.log('🚀 Starting image generation with params:', {
      prompt,
      itemType,
      aspectRatio,
      hasReferenceImage: !!referenceImageUrl
    })

    if (!prompt) {
      console.error('❌ No prompt provided')
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
      console.error('❌ Prompt sanitization failed')
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
    console.log('📝 Enhanced prompt created:', enhancedPrompt)

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured')
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Get dimensions from aspect ratio
    const size = getDimensionsFromAspectRatio(aspectRatio);
    console.log('📐 Image size determined:', size)

    // Call OpenAI API with retry logic
    console.log('🎨 Calling OpenAI API...')
    const response = await callOpenAIWithRetry(OPENAI_API_KEY, enhancedPrompt, size);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI API error:', errorData);
      return handleOpenAIError(errorData);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received:', { hasData: !!data, hasUrl: !!data?.data?.[0]?.url })

    if (!data?.data?.[0]?.url) {
      console.error('❌ No image URL in OpenAI response')
      throw new Error('No image URL returned from the API');
    }

    const imageUrl = data.data[0].url;
    console.log('🖼️ Image URL received from OpenAI:', imageUrl)

    // Process and store the image
    console.log('💾 Processing and storing image...')
    const publicUrl = await processAndStoreImage(imageUrl);
    console.log('✅ Image stored with public URL:', publicUrl)

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
    console.error('💥 Error in generate-image function:', error);
    
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
      console.log(`🔄 OpenAI API attempt ${i + 1}/${retries + 1}`)
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

      console.log(`📡 OpenAI API response status: ${response.status}`)
      return response;
    } catch (error) {
      console.error(`❌ OpenAI API attempt ${i + 1} failed:`, error);
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  
  throw new Error('Failed to call OpenAI API after retries');
}

function handleOpenAIError(errorData: any): Response {
  let errorMessage = "Failed to generate image";
  let statusCode = 500;

  console.error('🔍 Analyzing OpenAI error:', errorData)

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
  console.log('📥 Fetching generated image from OpenAI...')
  
  // Fetch the generated image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    console.error('❌ Failed to fetch generated image:', imageResponse.status)
    throw new Error('Failed to fetch generated image');
  }
  const imageBlob = await imageResponse.blob();
  console.log('✅ Image fetched successfully, size:', imageBlob.size)

  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase configuration missing')
    throw new Error('Supabase configuration is missing');
  }

  const supabaseClient = createClient(supabaseUrl, supabaseKey);
  console.log('🔧 Supabase client created')

  // Ensure bucket exists
  console.log('🪣 Ensuring storage bucket exists...')
  await ensureBucketExists(supabaseClient);

  // Upload to Supabase Storage
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
  console.log('📤 Uploading to storage with filename:', fileName)
  
  const { data: uploadData, error: uploadError } = await supabaseClient.storage
    .from('generated-images')
    .upload(fileName, imageBlob, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('❌ Upload error:', uploadError);
    throw new Error(`Failed to upload generated image: ${uploadError.message}`);
  }

  console.log('✅ Image uploaded successfully:', uploadData)

  // Get the public URL
  const { data: { publicUrl } } = supabaseClient.storage
    .from('generated-images')
    .getPublicUrl(fileName);

  console.log('🌐 Public URL generated:', publicUrl)
  return publicUrl;
}

async function ensureBucketExists(supabaseClient: any) {
  try {
    console.log('🔍 Checking if generated-images bucket exists...')
    const { data: bucketData, error: bucketCheckError } = await supabaseClient.storage
      .getBucket('generated-images');
    
    if (bucketCheckError && bucketCheckError.message.includes('not found')) {
      console.log('🆕 Creating generated-images bucket...')
      const { data: newBucket, error: createError } = await supabaseClient.storage
        .createBucket('generated-images', {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        throw new Error('Failed to create storage bucket');
      }
      
      console.log('✅ Created storage bucket "generated-images"');
    } else if (bucketCheckError) {
      console.error('❌ Error checking bucket:', bucketCheckError);
      throw new Error('Failed to check storage bucket');
    } else {
      console.log('✅ Bucket already exists');
    }
  } catch (bucketError) {
    console.error('❌ Error in bucket operations:', bucketError);
    // Continue anyway, the upload will fail if the bucket truly doesn't exist
  }
}
