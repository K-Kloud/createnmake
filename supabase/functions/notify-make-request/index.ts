import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyMakeRequestPayload {
  requestId: string;
  userId: string;
  creatorId: string;
  productDetails: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const resend = new Resend(resendApiKey);

    const { requestId, userId, creatorId, productDetails }: NotifyMakeRequestPayload = await req.json();

    console.log('Processing make request notification:', { requestId, userId, creatorId });

    // Get user profiles
    const [userResult, creatorResult, adminResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('profiles').select('*').eq('id', creatorId).single(),
      supabase.from('admin_roles').select('user_id').eq('role', 'admin').limit(1).single()
    ]);

    const userProfile = userResult.data;
    const creatorProfile = creatorResult.data;
    const adminUserId = adminResult.data?.user_id;

    // Get admin profile if available
    let adminProfile = null;
    if (adminUserId) {
      const adminProfileResult = await supabase.from('profiles').select('*').eq('id', adminUserId).single();
      adminProfile = adminProfileResult.data;
    }

    // Get user email addresses from auth.users
    const [userAuthResult, creatorAuthResult, adminAuthResult] = await Promise.all([
      supabase.auth.admin.getUserById(userId),
      supabase.auth.admin.getUserById(creatorId),
      adminUserId ? supabase.auth.admin.getUserById(adminUserId) : Promise.resolve(null)
    ]);

    const userEmail = userAuthResult.data.user?.email;
    const creatorEmail = creatorAuthResult.data.user?.email;
    const adminEmail = adminAuthResult?.data.user?.email;

    const emails = [];

    // Email to user (confirmation)
    if (userEmail) {
      emails.push({
        from: 'OpenTeknologies <noreply@openteknologies.com>',
        to: [userEmail],
        subject: 'Make Request Submitted Successfully',
        html: `
          <h2>Make Request Submitted</h2>
          <p>Dear ${userProfile?.display_name || 'User'},</p>
          <p>Your request to make the design "${productDetails.product_prompt}" has been successfully submitted.</p>
          
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h3>Request Details:</h3>
            <p><strong>Design:</strong> ${productDetails.product_prompt}</p>
            <p><strong>Original Price:</strong> ${productDetails.product_price}</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
          </div>
          
          <p>Our artisans and manufacturers will review your request and contact you with quotes and availability.</p>
          <p>You will receive email updates as your request progresses.</p>
          
          <p>Thank you for choosing OpenTeknologies!</p>
        `
      });
    }

    // Email to creator (notification)
    if (creatorEmail) {
      emails.push({
        from: 'OpenTeknologies <noreply@openteknologies.com>',
        to: [creatorEmail],
        subject: 'New Make Request for Your Design',
        html: `
          <h2>New Make Request</h2>
          <p>Dear ${creatorProfile?.display_name || 'Creator'},</p>
          <p>Someone has requested to make your design "${productDetails.product_prompt}".</p>
          
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h3>Request Details:</h3>
            <p><strong>Design:</strong> ${productDetails.product_prompt}</p>
            <p><strong>Requested by:</strong> ${userProfile?.display_name || 'User'}</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
          </div>
          
          <p>This request will be forwarded to our manufacturing partners. You may be contacted for additional design specifications or licensing arrangements.</p>
          
          <p>Best regards,<br>OpenTeknologies Team</p>
        `
      });
    }

    // Email to admin (notification)
    if (adminEmail) {
      emails.push({
        from: 'OpenTeknologies <noreply@openteknologies.com>',
        to: [adminEmail],
        subject: 'New Make Request - Admin Notification',
        html: `
          <h2>New Make Request - Admin Notification</h2>
          <p>A new make request has been submitted:</p>
          
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h3>Request Details:</h3>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Design:</strong> ${productDetails.product_prompt}</p>
            <p><strong>Requested by:</strong> ${userProfile?.display_name || 'User'} (${userEmail})</p>
            <p><strong>Creator:</strong> ${creatorProfile?.display_name || 'Creator'} (${creatorEmail})</p>
            <p><strong>Original Price:</strong> ${productDetails.product_price}</p>
          </div>
          
          <p>Please review and assign to appropriate artisans/manufacturers.</p>
          
          <p><a href="${supabaseUrl}/admin/make-requests/${requestId}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Dashboard</a></p>
        `
      });
    }

    // Send all emails
    const emailResults = await Promise.allSettled(
      emails.map(email => resend.emails.send(email))
    );

    console.log('Email results:', emailResults);

    // Log the notification attempt
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'make_request_notification_sent',
      action_details: {
        request_id: requestId,
        emails_sent: emailResults.filter(r => r.status === 'fulfilled').length,
        total_emails: emails.length,
        recipients: [userEmail, creatorEmail, adminEmail].filter(Boolean)
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent successfully',
        emails_sent: emailResults.filter(r => r.status === 'fulfilled').length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-make-request function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});