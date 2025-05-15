
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface NotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, any>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: NotificationRequest = await req.json();
    const { userId, title, message, type, metadata = {} } = payload;

    if (!userId || !title || !message || !type) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: userId, title, message, type",
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Insert notification
    const { data, error } = await supabaseClient
      .from("user_notifications")
      .insert({
        user_id: userId,
        title,
        message,
        notification_type: type,
        metadata
      })
      .select();

    if (error) {
      console.error("Error sending notification:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Enable real-time notifications by broadcasting to user-specific channel
    try {
      await supabaseClient.from('user_notifications')
        .update({ broadcast: true })
        .eq('id', data[0].id);
    } catch (broadcastError) {
      console.error("Broadcasting error (non-critical):", broadcastError);
      // Continue even if broadcasting fails - notification is still saved
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
    );
  }
});
