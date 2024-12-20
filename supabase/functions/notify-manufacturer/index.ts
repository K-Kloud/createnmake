import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  manufacturerId: string;
  title: string;
  message: string;
  type: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const notification: NotificationRequest = await req.json();

    // Get manufacturer details
    const { data: manufacturer, error: manufacturerError } = await supabase
      .from("manufacturers")
      .select("business_name, contact_email")
      .eq("id", notification.manufacturerId)
      .single();

    if (manufacturerError) throw manufacturerError;

    // Create notification in database
    const { error: notificationError } = await supabase
      .from("manufacturer_notifications")
      .insert({
        manufacturer_id: notification.manufacturerId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
      });

    if (notificationError) throw notificationError;

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "OpenT <notifications@opent.dev>",
        to: [manufacturer.contact_email],
        subject: notification.title,
        html: `
          <h2>Hello ${manufacturer.business_name},</h2>
          <p>${notification.message}</p>
          <p>Best regards,<br>OpenT Team</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error("Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in notify-manufacturer function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);