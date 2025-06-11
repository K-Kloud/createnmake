
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { imageUrl, maskDataUrl, editPrompt, originalImageId } = await req.json();

    console.log('🎨 Starting inpainting process');

    // Convert data URLs to blobs for OpenAI API
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    
    const maskResponse = await fetch(maskDataUrl);
    const maskBlob = await maskResponse.blob();

    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('mask', maskBlob, 'mask.png');
    formData.append('prompt', editPrompt);
    formData.append('model', 'dall-e-2');
    formData.append('n', '1');
    formData.append('size', '1024x1024');
    formData.append('response_format', 'url');

    // Call OpenAI inpainting API
    const openaiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to generate inpainted image');
    }

    const result = await openaiResponse.json();
    const editedImageUrl = result.data[0].url;

    console.log('✅ Inpainting successful, image URL:', editedImageUrl);

    // Get the next version number for this image
    const { data: existingVersions } = await supabase
      .from('generated_images')
      .select('edit_version')
      .or(`id.eq.${originalImageId},original_image_id.eq.${originalImageId}`)
      .order('edit_version', { ascending: false })
      .limit(1);

    const nextVersion = existingVersions && existingVersions.length > 0 
      ? (existingVersions[0].edit_version || 1) + 1 
      : 2;

    // Get original image details for copying metadata
    const { data: originalImage } = await supabase
      .from('generated_images')
      .select('*')
      .eq('id', originalImageId)
      .single();

    if (!originalImage) {
      throw new Error('Original image not found');
    }

    // Save the edited image to database
    const { data: savedImage, error: saveError } = await supabase
      .from('generated_images')
      .insert({
        user_id: user.id,
        prompt: originalImage.prompt,
        edit_prompt: editPrompt,
        image_url: editedImageUrl,
        item_type: originalImage.item_type,
        aspect_ratio: originalImage.aspect_ratio,
        original_image_id: originalImageId,
        edit_version: nextVersion,
        is_edited: true,
        mask_data: maskDataUrl,
        status: 'completed'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving edited image:', saveError);
      throw new Error('Failed to save edited image');
    }

    console.log('💾 Saved edited image to database:', savedImage.id);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: editedImageUrl,
        imageId: savedImage.id,
        version: nextVersion
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Inpainting error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
