import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced prompt engineering for Google Gemini following best practices
function enhancePromptForGemini(prompt: string, itemType: string, aspectRatio: string): string {
  const contextualIntents = {
    'basic-t-shirt': 'Create a high-quality product photography image for e-commerce display',
    'v-neck-t-shirt': 'Generate a professional fashion catalog image',
    'long-sleeve-t-shirt': 'Produce a lifestyle fashion photography shot',
    'tank-top': 'Create an athletic wear product showcase',
    'crop-top': 'Generate a trendy fashion editorial image',
    'blouse-silk': 'Produce luxury fashion photography',
    'button-down-shirt': 'Create professional business attire photography',
    'tunic': 'Generate bohemian style fashion imagery',
    'sweater-crew': 'Produce cozy winter fashion photography',
    'cardigan': 'Create layered fashion styling photography',
    'hoodie-pullover': 'Generate streetwear fashion photography',
    'polo-shirt': 'Create smart casual fashion imagery',
    'peasant-top': 'Produce vintage-inspired fashion photography',
    'camisole': 'Generate intimate apparel photography',
    'halter-top': 'Create summer fashion photography',
    'off-shoulder-top': 'Produce romantic fashion imagery',
    'tube-top': 'Generate party wear fashion photography',
    'bodysuit': 'Create form-fitting fashion photography',
    'kimono-top': 'Produce cultural fusion fashion imagery'
  };

  const photographicSpecs = {
    '1:1': 'square composition, centered framing, instagram-ready format',
    '4:3': 'standard photography ratio, professional portrait orientation',
    '16:9': 'wide cinematic composition, landscape editorial format',
    '9:16': 'vertical portrait format, story-ready composition',
    '3:4': 'tall portrait ratio, magazine cover format'
  };

  // Hyper-specific details based on clothing type
  const hyperSpecificDetails = {
    'basic-t-shirt': 'premium 100% organic cotton fabric with subtle texture, crew neckline with reinforced seaming, classic fit with slight taper at waist, hemline sitting perfectly at hip level',
    'v-neck-t-shirt': 'soft heather grey jersey knit with gentle drape, deep V-neckline creating elegant décolletage, fitted through torso with feminine silhouette',
    'long-sleeve-t-shirt': 'navy blue ribbed cotton blend, close-fitting sleeves with subtle stretch, crew neck with topstitched detail, length perfect for high-waisted bottoms',
    'tank-top': 'athletic-cut black ribbed tank with moisture-wicking properties, racerback design for freedom of movement, body-hugging fit showcasing athletic physique',
    'crop-top': 'sunny yellow knit with subtle cable texture, cropped at natural waist, three-quarter sleeves with slight puff detail, playful yet sophisticated styling',
    'blouse-silk': 'luxurious emerald green silk charmeuse with lustrous sheen, fluid drape catching light beautifully, delicate mother-of-pearl buttons, French seam construction',
    'button-down-shirt': 'crisp white Oxford cotton with subtle blue pinstripes, structured collar with perfect roll, mother-of-pearl buttons, tailored fit through waist',
    'tunic': 'flowing linen in warm beige tone, relaxed A-line silhouette, mandarin collar with button detail, three-quarter sleeves with subtle gathering',
    'sweater-crew': 'chunky charcoal grey wool blend with visible cable knit pattern, crew neckline with ribbed trim, cozy oversized fit perfect for layering',
    'cardigan': 'sophisticated burgundy merino wool in fine gauge knit, button-front closure with horn buttons, relaxed fit perfect for professional layering'
  };

  // Step-by-step scene construction
  const sceneConstruction = `
  Step 1: Create a professional photography studio background with seamless white backdrop and subtle gradient shadows.
  Step 2: Position bright, even studio lighting with key light at 45-degree angle and fill light to eliminate harsh shadows.
  Step 3: In the foreground, place a confident young Nigerian woman as the model, aged 22-28, with natural beauty and authentic expression.
  Step 4: Style the model wearing ${hyperSpecificDetails[itemType as keyof typeof hyperSpecificDetails] || 'the specified garment with attention to fabric texture and fit details'}.
  Step 5: Compose the shot using ${photographicSpecs[aspectRatio as keyof typeof photographicSpecs] || 'professional photography composition'}.
  `;

  // Context and intent
  const contextIntent = contextualIntents[itemType as keyof typeof contextualIntents] || 'Create a professional fashion photography image';

  // Camera and technical specifications
  const cameraSpecs = aspectRatio === '16:9' ? 'wide-angle shot capturing full context' :
                     aspectRatio === '9:16' ? 'vertical portrait shot with intimate framing' :
                     aspectRatio === '1:1' ? 'perfectly centered square composition' :
                     'medium shot with balanced composition';

  // Semantic positive description (avoiding negative prompts)
  const positiveEnvironment = 'pristine studio environment with perfect lighting control, professional fashion photography setup, high-end commercial quality, crystal clear focus with beautiful depth of field, luxurious fabric textures clearly visible, skin tones rendered with natural warmth and authenticity';

  return `${contextIntent}: ${sceneConstruction}

Technical Specifications: ${cameraSpecs}, shot with professional DSLR camera, 85mm lens for natural perspective, aperture f/4 for sharp subject focus with gentle background blur, ISO 100 for maximum image quality.

Environment: ${positiveEnvironment}

Model Direction: Natural, confident pose showcasing the garment's fit and movement, genuine smile with engaging eye contact, relaxed shoulders, hands positioned naturally to complement the outfit's style.

Original Prompt Enhancement: ${prompt}

Final Result: Ultra high resolution 8K quality image, photo-realistic rendering, detailed fabric texture, professional commercial photography standard, suitable for high-end fashion e-commerce and editorial use.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Google Gemini image generation started');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { prompt, itemType, aspectRatio, referenceImageUrl } = await req.json();
    console.log('📝 Request parameters:', { prompt, itemType, aspectRatio, hasReference: !!referenceImageUrl });

    if (!prompt || !itemType || !aspectRatio) {
      throw new Error('Missing required parameters: prompt, itemType, aspectRatio');
    }

    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!googleApiKey) {
      throw new Error('Google AI API key not configured');
    }

    // Enhanced prompt with Google's best practices
    const enhancedPrompt = enhancePromptForGemini(prompt, itemType, aspectRatio);
    console.log('✨ Enhanced prompt created with hyper-specific details');

    // Convert aspect ratio to dimensions
    const dimensionMap: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '16:9': { width: 1152, height: 648 },
      '9:16': { width: 648, height: 1152 },
      '3:4': { width: 768, height: 1024 }
    };

    const dimensions = dimensionMap[aspectRatio] || { width: 1024, height: 1024 };

    // Call Google Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.95,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('❌ Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorData}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('📸 Gemini response received');

    // Extract image data from Gemini response
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content || !geminiData.candidates[0].content.parts) {
      console.error('❌ Invalid Gemini response structure:', JSON.stringify(geminiData, null, 2));
      throw new Error('Invalid response format from Gemini API');
    }

    // Find the image part in the response
    const imagePart = geminiData.candidates[0].content.parts.find((part: any) => part.inlineData && part.inlineData.mimeType);
    
    if (!imagePart || !imagePart.inlineData || !imagePart.inlineData.data) {
      console.error('❌ No image data found in Gemini response');
      throw new Error('No image generated by Gemini API');
    }

    const imageBase64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;
    
    console.log('🎨 Image generated successfully, saving to database...');

    // Save to database
    const { data: imageRecord, error: dbError } = await supabaseClient
      .from('generated_images')
      .insert({
        user_id: user.id,
        prompt: prompt,
        item_type: itemType,
        aspect_ratio: aspectRatio,
        image_url: `data:${mimeType};base64,${imageBase64}`,
        reference_image_url: referenceImageUrl,
        status: 'completed',
        provider: 'google-gemini'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('✅ Image saved to database successfully');

    return new Response(JSON.stringify({
      success: true,
      imageUrl: `data:${mimeType};base64,${imageBase64}`,
      imageId: imageRecord.id,
      provider: 'google-gemini',
      enhancedPrompt: enhancedPrompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in generate-image-gemini:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const suggestions = [];
    
    if (errorMessage.includes('API key')) {
      suggestions.push('Verify your Google AI API key is correctly configured');
    }
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      suggestions.push('Check your Google AI API usage limits and billing');
    }
    if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      suggestions.push('Try rephrasing your prompt to avoid content policy issues');
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      suggestions: suggestions,
      provider: 'google-gemini'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});