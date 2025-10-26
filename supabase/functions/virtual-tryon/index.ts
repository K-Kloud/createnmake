import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, bodyImageUrl, clothingImageUrl, settings } = await req.json();

    console.log("Virtual try-on request:", { sessionId, bodyImageUrl, clothingImageUrl, settings });

    // Check for Authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("[Virtual Try-On] Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("[Virtual Try-On] Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required. Please sign in and try again." }), 
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with auth header
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    console.log("[Virtual Try-On] Verifying user authentication...");
    
    // Get user from auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error("[Virtual Try-On] Authentication error:", userError.message);
      return new Response(
        JSON.stringify({ error: `Authentication failed: ${userError.message}` }), 
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!user) {
      console.error("[Virtual Try-On] No user found in token");
      return new Response(
        JSON.stringify({ error: "Invalid authentication token. Please sign in again." }), 
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[Virtual Try-On] User authenticated: ${user.id}`);

    // Check subscription limits
    console.log(`[Virtual Try-On] Checking subscription limits for user ${user.id}`);
    const { data: subscriptionData, error: subError } = await supabaseClient.functions.invoke(
      "check-subscription"
    );

    if (subError) {
      console.error("[Virtual Try-On] Failed to check subscription:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to verify subscription status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user can generate images
    if (!subscriptionData.can_generate_image) {
      const remainingImages = subscriptionData.remaining_images || 0;
      return new Response(
        JSON.stringify({ 
          error: `Monthly limit reached. You have ${remainingImages} virtual try-ons remaining this month. Upgrade your plan for more.`,
          limit_reached: true
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Virtual Try-On] User has ${subscriptionData.remaining_images} try-ons remaining`);

    // Update session status to processing
    console.log(`[Virtual Try-On] Updating session ${sessionId} to processing`);
    const { error: updateError } = await supabaseClient
      .from("virtual_tryon_sessions")
      .update({ 
        status: "processing", 
        updated_at: new Date().toISOString(),
        settings: settings || {}
      })
      .eq("id", sessionId);

    if (updateError) {
      throw new Error(`Failed to update session: ${updateError.message}`);
    }

    console.log(`[Virtual Try-On] Session updated. Body: ${bodyImageUrl}, Clothing: ${clothingImageUrl}`);

    // Get Lovable API key for AI image generation
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Prepare the enhanced prompt for Gemini to composite the images
    const fitAdjustment = settings?.fitAdjustment || 'regular';
    const preserveBackground = settings?.preserveBackground !== false;
    const enhanceQuality = settings?.enhanceQuality !== false;

    const prompt = `You are an expert Nigerian fashion stylist and advanced photo compositor specializing in African fashion and clothing design. 

INPUT IMAGES:
1. Reference photo: A person whose body, pose, and environment must be preserved exactly
2. Clothing design: A generated garment that needs to be realistically fitted onto the person

TASK: Create a photorealistic composite showing the clothing design worn naturally by the person.

CRITICAL COMPOSITION REQUIREMENTS:
• Body Preservation: Keep the exact body pose, proportions, and position from the reference photo
• Background: ${preserveBackground ? 'Preserve the original background completely, including all environmental details' : 'You may adjust background for better composition'}
• Lighting Match: Analyze and replicate the exact lighting direction, intensity, color temperature, and shadows from the reference photo
• Skin & Features: Preserve all skin tones, facial features, hair, and non-clothing body parts exactly as they appear

CLOTHING INTEGRATION (FIT: ${fitAdjustment.toUpperCase()}):
• Fabric Drape: Simulate realistic fabric physics with natural folds, wrinkles, and movement based on body shape and pose
• Fit Style: ${fitAdjustment === 'tight' ? 'Form-fitting with minimal wrinkles, showing body contours' : fitAdjustment === 'loose' ? 'Relaxed fit with generous drape and flowing movement' : 'Regular fit that follows body shape naturally with moderate drape'}
• Perspective Match: Ensure clothing follows the same 3D perspective and viewing angle as the body
• Shadows & Highlights: Cast realistic shadows from the clothing onto the body and vice versa
• Seams & Details: Preserve all design details, patterns, textures, and embellishments from the clothing image
• Edge Blending: Seamlessly blend clothing edges with skin at neckline, sleeves, hem - no harsh lines or pasting artifacts

NIGERIAN FASHION CONTEXT:
• Respect traditional fabric patterns like Ankara, Aso-Oke, George if present
• Maintain cultural styling elements and proportions appropriate to Nigerian fashion
• Ensure colors remain vibrant and authentic to African textile traditions
• Consider how traditional garments typically drape and fit on Nigerian body types

QUALITY REQUIREMENTS:
• Photorealism: The final image must look like a real photograph, not a digital composite
• Resolution: ${enhanceQuality ? 'Ultra high resolution with sharp details, 8K quality' : 'High quality output'}
• Natural Integration: The clothing should look naturally worn, with appropriate tension, compression, and stretch
• Color Consistency: Match color temperature and saturation across all elements
• No Artifacts: Eliminate any visible seams, halos, unnatural edges, or AI generation artifacts

SETTINGS APPLIED:
${JSON.stringify(settings || {}, null, 2)}

OUTPUT: Generate the final composite image showing this person wearing the clothing design with perfect photorealistic integration.`;

    // Call Gemini via Lovable AI Gateway for image composition
    console.log(`[Virtual Try-On] Calling AI Gateway for image composition`);
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: bodyImageUrl } },
              { type: "image_url", image_url: { url: clothingImageUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[Virtual Try-On] AI Gateway error (${aiResponse.status}):`, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few moments.");
      } else if (aiResponse.status === 402) {
        throw new Error("Payment required. Please add credits to your workspace.");
      }
      
      throw new Error(`AI generation failed: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log(`[Virtual Try-On] AI response received`);
    
    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error(`[Virtual Try-On] No image in AI response:`, JSON.stringify(aiData).substring(0, 500));
      throw new Error("No image generated by AI. The model may not have been able to process the images.");
    }

    // Upload the result to storage
    console.log(`[Virtual Try-On] Converting and uploading result image`);
    const timestamp = Date.now();
    const fileName = `${user.id}/${sessionId}_${timestamp}.png`;

    // Convert base64 to blob if needed
    let imageBlob: Blob;
    if (generatedImageUrl.startsWith("data:")) {
      const base64Data = generatedImageUrl.split(",")[1];
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      imageBlob = new Blob([binaryData], { type: "image/png" });
    } else {
      const imageResponse = await fetch(generatedImageUrl);
      imageBlob = await imageResponse.blob();
    }

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("tryon-results")
      .upload(fileName, imageBlob, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error(`[Virtual Try-On] Storage upload error:`, uploadError);
      throw new Error(`Failed to upload result: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from("tryon-results")
      .getPublicUrl(fileName);

    const resultUrl = urlData.publicUrl;
    console.log(`[Virtual Try-On] Result uploaded successfully: ${resultUrl}`);

    // Update session with result
    const { error: finalUpdateError } = await supabaseClient
      .from("virtual_tryon_sessions")
      .update({
        status: "completed",
        tryon_result_url: resultUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (finalUpdateError) {
      console.error("[Virtual Try-On] Failed to update session:", finalUpdateError);
    }

    console.log(`[Virtual Try-On] Session ${sessionId} completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        resultUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Virtual Try-On] Error:", error);

    // Try to update session status to failed
    if (error instanceof Error) {
      try {
        const { sessionId } = await req.json();
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const errorMessage = error.message;
        console.log(`[Virtual Try-On] Updating session ${sessionId} to failed: ${errorMessage}`);

        await supabaseClient
          .from("virtual_tryon_sessions")
          .update({
            status: "failed",
            error_message: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      } catch (updateError) {
        console.error("[Virtual Try-On] Failed to update error status:", updateError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Virtual try-on failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
