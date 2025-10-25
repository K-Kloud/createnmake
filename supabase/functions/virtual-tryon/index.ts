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

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get user from auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update session status to processing
    await supabaseClient
      .from("virtual_tryon_sessions")
      .update({ status: "processing" })
      .eq("id", sessionId);

    // Get Lovable API key for AI image generation
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Prepare the prompt for Gemini to composite the images
    const prompt = `You are an expert fashion stylist and photo compositor. I'm providing you with two images:
1. A full-body reference photo of a person
2. A generated clothing design

Your task is to create a photorealistic composite showing the generated clothing ON the person from the reference photo. 

CRITICAL REQUIREMENTS:
- Preserve the exact body pose, background, and lighting from the reference photo
- Replace ONLY the clothing area with the generated design
- Match the clothing to the body's perspective, shadows, and wrinkles
- Maintain natural fabric drape and fit based on body shape
- Keep the result photorealistic with consistent lighting
- Preserve skin tones, hair, and all non-clothing elements from the reference
- Ensure the clothing looks naturally worn, not pasted on

Settings: ${JSON.stringify(settings || {})}

Generate the final composite image showing this person wearing the generated clothing design.`;

    // Call Gemini via Lovable AI Gateway for image composition
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
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error("No image generated from AI");
    }

    // Upload the result to storage
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
      .from("tryon-references")
      .upload(fileName, imageBlob, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Failed to upload result: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from("tryon-references")
      .getPublicUrl(fileName);

    const resultUrl = urlData.publicUrl;

    // Update session with result
    const { error: updateError } = await supabaseClient
      .from("virtual_tryon_sessions")
      .update({
        status: "completed",
        tryon_result_url: resultUrl,
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Failed to update session:", updateError);
    }

    console.log("Try-on completed successfully:", { sessionId, resultUrl });

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
    console.error("Error in virtual-tryon function:", error);

    // Try to update session status to failed
    if (error instanceof Error) {
      try {
        const { sessionId } = await req.json();
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        await supabaseClient
          .from("virtual_tryon_sessions")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", sessionId);
      } catch (updateError) {
        console.error("Failed to update error status:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
