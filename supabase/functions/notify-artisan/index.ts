
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequest {
  artisanId: string;
  userId: string;
  productDetails: string;
  imageUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const quoteRequest: QuoteRequest = await req.json();

    // Get artisan details
    const { data: artisan, error: artisanError } = await supabase
      .from("profiles")
      .select("username, business_name")
      .eq("id", quoteRequest.artisanId)
      .single();

    if (artisanError) throw artisanError;

    // Create quote request in database
    const { data: quote, error: quoteError } = await supabase
      .from("artisan_quotes")
      .insert({
        artisan_id: quoteRequest.artisanId,
        user_id: quoteRequest.userId,
        product_details: quoteRequest.productDetails,
        status: "pending"
      })
      .select()
      .single();

    if (quoteError) throw quoteError;

    // Get user details
    const { data: user } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", quoteRequest.userId)
      .single();

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "OpenTeknologies <notifications@openteknologies.com>",
        to: [artisan.email],
        subject: "New Quote Request",
        html: `
          <h2>Hello ${artisan.business_name || artisan.username},</h2>
          <p>You have received a new quote request from ${user?.username || 'a user'}.</p>
          <p>Product Details:</p>
          <p>${quoteRequest.productDetails}</p>
          <p>Generated Image: <a href="${quoteRequest.imageUrl}">View Image</a></p>
          <p>Please log in to your dashboard to respond to this request.</p>
          <p>Best regards,<br>OpenTeknologies Team</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      console.error('Failed to send email:', await emailResponse.text());
    }

    return new Response(JSON.stringify({ success: true, quoteId: quote.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in notify-artisan function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
