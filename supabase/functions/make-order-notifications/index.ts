import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderType: 'artisan' | 'manufacturer';
  orderId: string;
  orderData: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { orderType, orderId, orderData }: OrderNotificationRequest = await req.json();

    console.log(`Processing ${orderType} order notification for order ${orderId}`);

    // Get customer details
    const { data: customer } = await supabase
      .from("profiles")
      .select("username, email")
      .eq("id", orderData.user_id)
      .single();

    // Get customer email from auth if not in profiles
    let customerEmail = customer?.email;
    if (!customerEmail) {
      const { data: authUser } = await supabase.auth.admin.getUserById(orderData.user_id);
      customerEmail = authUser.user?.email;
    }

    // Get super admins
    const { data: superAdmins } = await supabase
      .from("admin_roles")
      .select(`
        user_id,
        profiles!inner(username, email)
      `)
      .eq("role", "super_admin");

    let recipients: Array<{ email: string; role: string; name?: string }> = [];

    // Add customer notification
    if (customerEmail) {
      recipients.push({
        email: customerEmail,
        role: 'customer',
        name: customer?.username
      });
    }

    // Add super admin notifications
    for (const admin of superAdmins || []) {
      let adminEmail = admin.profiles?.email;
      if (!adminEmail) {
        const { data: authUser } = await supabase.auth.admin.getUserById(admin.user_id);
        adminEmail = authUser.user?.email;
      }
      if (adminEmail) {
        recipients.push({
          email: adminEmail,
          role: 'super_admin',
          name: admin.profiles?.username
        });
      }
    }

    // Add artisan/manufacturer notification
    if (orderType === 'artisan' && orderData.artisan_id) {
      const { data: artisan } = await supabase
        .from("profiles")
        .select("username, business_name, email")
        .eq("id", orderData.artisan_id)
        .single();

      let artisanEmail = artisan?.email;
      if (!artisanEmail) {
        const { data: authUser } = await supabase.auth.admin.getUserById(orderData.artisan_id);
        artisanEmail = authUser.user?.email;
      }

      if (artisanEmail) {
        recipients.push({
          email: artisanEmail,
          role: 'artisan',
          name: artisan?.business_name || artisan?.username
        });
      }
    } else if (orderType === 'manufacturer' && orderData.manufacturer_id) {
      const { data: manufacturer } = await supabase
        .from("manufacturers")
        .select("business_name, contact_email")
        .eq("id", orderData.manufacturer_id)
        .single();

      if (manufacturer?.contact_email) {
        recipients.push({
          email: manufacturer.contact_email,
          role: 'manufacturer',
          name: manufacturer.business_name
        });
      }
    }

    // Send notifications to all recipients
    const emailPromises = recipients.map(recipient => 
      sendOrderNotificationEmail(recipient, orderType, orderData, customer?.username)
    );

    const emailResults = await Promise.allSettled(emailPromises);
    
    // Log results
    const successCount = emailResults.filter(result => result.status === 'fulfilled').length;
    const failureCount = emailResults.filter(result => result.status === 'rejected').length;
    
    console.log(`Sent ${successCount} emails successfully, ${failureCount} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent: successCount,
      emailsFailed: failureCount,
      recipients: recipients.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in make-order-notifications function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

async function sendOrderNotificationEmail(
  recipient: { email: string; role: string; name?: string },
  orderType: 'artisan' | 'manufacturer',
  orderData: any,
  customerName?: string
) {
  const subject = getEmailSubject(recipient.role, orderType);
  const html = getEmailTemplate(recipient, orderType, orderData, customerName);

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "OpenT <notifications@openteknologies.com>",
      to: [recipient.email],
      subject: subject,
      html: html,
    }),
  });

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    console.error(`Failed to send email to ${recipient.email}:`, errorText);
    throw new Error(`Email send failed: ${errorText}`);
  }

  return emailResponse.json();
}

function getEmailSubject(role: string, orderType: string): string {
  const orderTypeTitle = orderType === 'artisan' ? 'Artisan' : 'Manufacturer';
  
  switch (role) {
    case 'customer':
      return `Order Request Submitted - ${orderTypeTitle} Quote`;
    case 'super_admin':
      return `New ${orderTypeTitle} Order Request - Admin Notification`;
    case 'artisan':
      return 'New Custom Order Request';
    case 'manufacturer':
      return 'New Manufacturing Quote Request';
    default:
      return `New ${orderTypeTitle} Order Request`;
  }
}

function getEmailTemplate(
  recipient: { email: string; role: string; name?: string },
  orderType: 'artisan' | 'manufacturer',
  orderData: any,
  customerName?: string
): string {
  const orderTypeTitle = orderType === 'artisan' ? 'Artisan' : 'Manufacturer';
  const recipientName = recipient.name || 'there';
  
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
      .order-details { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
      .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      .highlight { color: #667eea; font-weight: 600; }
    </style>
  `;

  if (recipient.role === 'customer') {
    return `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>Order Request Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hello ${recipientName}!</h2>
          <p>Thank you for your ${orderTypeTitle.toLowerCase()} order request. We've received your submission and our team is reviewing it.</p>
          
          <div class="order-details">
            <h3>Order Details:</h3>
            <p><strong>Product:</strong> ${orderData.product_details}</p>
            ${orderData.dimensions ? `<p><strong>Dimensions:</strong> ${orderData.dimensions}</p>` : ''}
            ${orderData.materials ? `<p><strong>Materials:</strong> ${orderData.materials}</p>` : ''}
            ${orderData.quantity ? `<p><strong>Quantity:</strong> ${orderData.quantity}</p>` : ''}
            ${orderData.budget_range ? `<p><strong>Budget Range:</strong> ${orderData.budget_range}</p>` : ''}
          </div>

          <p>You'll receive updates as your request is processed. Our team will connect you with qualified ${orderType}s who can fulfill your requirements.</p>
          
          <a href="https://openteknologies.com/orders" class="btn">Track Your Request</a>
        </div>
        <div class="footer">
          <p>Best regards,<br><strong>OpenT Team</strong></p>
        </div>
      </div>
    `;
  }

  if (recipient.role === 'super_admin') {
    return `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>New ${orderTypeTitle} Order Request</h1>
        </div>
        <div class="content">
          <h2>Hello Admin,</h2>
          <p>A new ${orderTypeTitle.toLowerCase()} order request has been submitted and requires administrative attention.</p>
          
          <div class="order-details">
            <h3>Order Information:</h3>
            <p><strong>Customer:</strong> ${customerName || 'Unknown'}</p>
            <p><strong>Order ID:</strong> <span class="highlight">#${orderData.id}</span></p>
            <p><strong>Product Details:</strong> ${orderData.product_details}</p>
            ${orderData.dimensions ? `<p><strong>Dimensions:</strong> ${orderData.dimensions}</p>` : ''}
            ${orderData.materials ? `<p><strong>Materials:</strong> ${orderData.materials}</p>` : ''}
            ${orderData.quantity ? `<p><strong>Quantity:</strong> ${orderData.quantity}</p>` : ''}
            ${orderData.budget_range ? `<p><strong>Budget Range:</strong> ${orderData.budget_range}</p>` : ''}
            ${orderData.timeline_days ? `<p><strong>Timeline:</strong> ${orderData.timeline_days} days</p>` : ''}
            ${orderData.special_requirements ? `<p><strong>Special Requirements:</strong> ${orderData.special_requirements}</p>` : ''}
          </div>

          <p>Please review this request in the admin dashboard and take appropriate action.</p>
          
          <a href="https://openteknologies.com/admin/orders" class="btn">Review in Dashboard</a>
        </div>
        <div class="footer">
          <p>OpenT Administrative System</p>
        </div>
      </div>
    `;
  }

  if (recipient.role === 'artisan') {
    return `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>New Custom Order Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${recipientName}!</h2>
          <p>You have received a new custom order request from ${customerName || 'a customer'}. This could be a great opportunity for your business!</p>
          
          <div class="order-details">
            <h3>Project Details:</h3>
            <p><strong>Description:</strong> ${orderData.product_details}</p>
            ${orderData.dimensions ? `<p><strong>Dimensions:</strong> ${orderData.dimensions}</p>` : ''}
            ${orderData.materials ? `<p><strong>Preferred Materials:</strong> ${orderData.materials}</p>` : ''}
            ${orderData.colors ? `<p><strong>Colors:</strong> ${orderData.colors}</p>` : ''}
            ${orderData.quantity ? `<p><strong>Quantity:</strong> ${orderData.quantity}</p>` : ''}
            ${orderData.budget_range ? `<p><strong>Budget Range:</strong> ${orderData.budget_range}</p>` : ''}
            ${orderData.timeline_days ? `<p><strong>Desired Timeline:</strong> ${orderData.timeline_days} days</p>` : ''}
            ${orderData.special_requirements ? `<p><strong>Special Requirements:</strong> ${orderData.special_requirements}</p>` : ''}
          </div>

          <p>Please log in to your dashboard to review the full request and submit your quote.</p>
          
          <a href="https://openteknologies.com/artisan/quotes" class="btn">Review & Quote</a>
        </div>
        <div class="footer">
          <p>Best regards,<br><strong>OpenT Team</strong></p>
        </div>
      </div>
    `;
  }

  if (recipient.role === 'manufacturer') {
    return `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>New Manufacturing Quote Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${recipientName}!</h2>
          <p>You have received a new manufacturing quote request from ${customerName || 'a customer'}.</p>
          
          <div class="order-details">
            <h3>Manufacturing Specifications:</h3>
            <p><strong>Product:</strong> ${orderData.product_details}</p>
            ${orderData.dimensions ? `<p><strong>Dimensions:</strong> ${orderData.dimensions}</p>` : ''}
            ${orderData.materials ? `<p><strong>Materials:</strong> ${orderData.materials}</p>` : ''}
            ${orderData.quantity ? `<p><strong>Quantity:</strong> ${orderData.quantity}</p>` : ''}
            ${orderData.budget_range ? `<p><strong>Budget Range:</strong> ${orderData.budget_range}</p>` : ''}
            ${orderData.timeline_days ? `<p><strong>Timeline:</strong> ${orderData.timeline_days} days</p>` : ''}
            ${orderData.special_requirements ? `<p><strong>Special Requirements:</strong> ${orderData.special_requirements}</p>` : ''}
          </div>

          <p>Please review the specifications and provide your manufacturing quote through the platform.</p>
          
          <a href="https://openteknologies.com/manufacturer/quotes" class="btn">Review & Quote</a>
        </div>
        <div class="footer">
          <p>Best regards,<br><strong>OpenT Team</strong></p>
        </div>
      </div>
    `;
  }

  return `<p>Order notification for ${recipientName}</p>`;
}

serve(handler);