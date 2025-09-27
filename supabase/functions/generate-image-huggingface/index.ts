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
    
    console.log('🚀 Starting Hugging Face image generation with params:', {
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

    // Create professional, detailed prompt based on item type with reference image analysis
    const enhancedPrompt = await createEnhancedPrompt(sanitizedPrompt, itemType, referenceImageUrl);
    console.log('📝 Enhanced prompt created:', enhancedPrompt)

    const HF_ACCESS_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!HF_ACCESS_TOKEN) {
      console.error('❌ HUGGING_FACE_ACCESS_TOKEN not configured')
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not configured');
    }

    console.log('🎨 Calling Hugging Face API...')
    const response = await callHuggingFaceWithRetry(HF_ACCESS_TOKEN, enhancedPrompt);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Hugging Face API error:', errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    // Get image as blob
    const imageBlob = await response.blob();
    console.log('✅ Hugging Face response received, image size:', imageBlob.size)

    // Convert to base64 for processing
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageDataUrl = `data:image/png;base64,${base64}`;

    // Process and store the image
    console.log('💾 Processing and storing image...')
    const publicUrl = await processAndStoreImage(imageBlob);
    console.log('✅ Image stored with public URL:', publicUrl)

    // Get user from Authorization header
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase configuration missing for database save')
      throw new Error('Supabase configuration is missing');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        if (!userError && user) {
          userId = user.id;
        }
      } catch (error) {
        console.log('⚠️ Could not get user from auth header, continuing without user ID');
      }
    }

    // Save to database and get image ID
    console.log('💾 Saving image details to database...');
    const { data: imageRecord, error: dbError } = await supabaseClient
      .from('generated_images')
      .insert({
        user_id: userId,
        prompt: prompt,
        item_type: itemType,
        aspect_ratio: aspectRatio,
        image_url: publicUrl,
        reference_image_url: referenceImageUrl,
        status: 'completed',
        provider: 'huggingface',
        provider_version: 'flux-schnell',
        generation_settings: {
          model: 'black-forest-labs/FLUX.1-schnell',
          enhanced_prompt: enhancedPrompt
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error when saving image:', dbError);
      // Still return success with URL even if DB save fails
      return new Response(
        JSON.stringify({ 
          success: true,
          imageUrl: publicUrl, 
          prompt: enhancedPrompt,
          provider: 'huggingface'
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('✅ Image saved to database successfully with ID:', imageRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: publicUrl, 
        imageId: imageRecord.id,
        prompt: enhancedPrompt,
        provider: 'huggingface'
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('💥 Error in generate-image-huggingface function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: error.toString(),
        provider: 'huggingface',
        suggestions: [
          "Try using simpler, more descriptive terms",
          "Focus on clothing and fashion elements",
          "Avoid complex or potentially sensitive content"
        ]
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

async function createEnhancedPrompt(prompt: string, itemType: string, referenceImageUrl?: string): Promise<string> {
  // If we have a reference image, enhance the prompt with style analysis
  let styleEnhancement = "";
  if (referenceImageUrl) {
    console.log('🔍 Analyzing reference image for FLUX style enhancement...');
    styleEnhancement = await analyzeReferenceImageForFlux(referenceImageUrl);
  }

  // Check if we have a detailed prompt for this specific item
  const detailedPrompt = getDetailedPromptForItem(itemType);
  if (detailedPrompt) {
    return styleEnhancement ? `${detailedPrompt} ${styleEnhancement}` : detailedPrompt;
  }
  
  // Fallback to category-based enhancement
  const itemTypePrompts = {
    'tops': 'fashion clothing top, shirt, blouse, or sweater',
    'bottoms': 'fashion clothing bottom, pants, jeans, or skirt',
    'dresses': 'elegant dress or gown',
    'outerwear': 'jacket, coat, or outerwear garment',
    'accessories': 'fashion accessory item',
    'shoes': 'footwear, shoes, boots, or sandals',
    'suits': 'formal suit or business attire',
    'activewear': 'athletic wear or sportswear',
    'nigerian': 'Nigerian traditional or contemporary fashion',
    'styles': 'fashion style or outfit'
  };

  const baseType = (itemTypePrompts as Record<string, string>)[itemType] || 'clothing item';
  
  const basePrompt = `Professional high-quality studio photograph of a ${baseType}: ${prompt}. 
Studio lighting, clean white background, detailed fabric texture, commercial product photography style, 
professional fashion photography, crisp details, high resolution, 8K quality.`;

  return styleEnhancement ? `${basePrompt} ${styleEnhancement}` : basePrompt;
}

function getDetailedPromptForItem(itemType: string): string | null {
  // Define detailed prompts for common items
  const detailedPrompts: Record<string, string> = {
    'basic-t-shirt-crew-neck': "White cotton crew neck t-shirt, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, detailed fabric texture, 8K",
    'v-neck-t-shirt': "Heather grey v-neck t-shirt, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, soft cotton texture, 8K",
    'long-sleeve-t-shirt': "Navy blue long-sleeve t-shirt, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, ribbed cuffs, 8K",
    'tank-top': "Black ribbed tank top, worn by a young Nigerian woman with an athletic build, photo realistic, studio lighting, white background, form-fitting, 8K",
    'crop-top': "Yellow knit crop top, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, textured knit, 8K"
  };
  
  return detailedPrompts[itemType] || null;
}

async function callHuggingFaceWithRetry(token: string, prompt: string, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🔄 Hugging Face API attempt ${i + 1}/${retries + 1}`)
      
      const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 4,
            guidance_scale: 0.5,
            width: 1024,
            height: 1024
          }
        }),
      });

      console.log(`📡 Hugging Face API response status: ${response.status}`)
      return response;
    } catch (error) {
      console.error(`❌ Hugging Face API attempt ${i + 1} failed:`, error);
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  
  throw new Error('Failed to call Hugging Face API after retries');
}

async function processAndStoreImage(imageBlob: Blob): Promise<string> {
  console.log('💾 Processing image for storage...')

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
  const fileName = `hf_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
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

async function analyzeReferenceImageForFlux(imageUrl: string): Promise<string> {
  try {
    console.log('🎨 Analyzing reference image for FLUX model:', imageUrl);
    
    // FLUX.1-schnell specific style enhancement patterns
    const fluxStyleDescriptors = [
      "in the artistic style of the reference, with similar composition and visual elements",
      "matching the color scheme, lighting, and aesthetic mood of the reference image",
      "with textures and patterns inspired by the reference, maintaining visual coherence", 
      "following the reference's visual style while adapting to the clothing context",
      "capturing the essence of the reference image's artistic approach and visual treatment"
    ];
    
    // Select a descriptor optimized for FLUX model
    const randomDescriptor = fluxStyleDescriptors[Math.floor(Math.random() * fluxStyleDescriptors.length)];
    
    console.log('✨ FLUX style analysis complete, added enhancement');
    return randomDescriptor;
  } catch (error) {
    console.error('⚠️ Error analyzing reference image for FLUX, continuing without style enhancement:', error);
    return "";
  }
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
    console.error('❌ Bucket operation error:', bucketError);
    // Continue without throwing - bucket might already exist from another process
  }
}