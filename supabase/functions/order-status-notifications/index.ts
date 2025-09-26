import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusChangeEvent {
  orderId: string;
  orderType: 'artisan' | 'manufacturer';
  status: string;
  previousStatus: string;
  notes?: string;
  eventType: 'status_change';
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const statusMessages = {
  pending: 'Your order is pending review',
  review: 'Your order is being reviewed by our team',
  completed: 'Your order has been completed!',
  cancelled: 'Your order has been cancelled',
  shipped: 'Your order has been shipped and is on its way!',
  delivered: 'Your order has been delivered successfully!'
};

const statusEmojis = {
  pending: '⏳',
  review: '👀',
  completed: '✅',
  cancelled: '❌',
  shipped: '🚚',
  delivered: '📦'
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, orderType, status, previousStatus, notes }: StatusChangeEvent = await req.json();

    console.log(`Processing status change for order ${orderId}: ${previousStatus} -> ${status}`);

    // Get order details
    const tableName = orderType === 'artisan' ? 'artisan_quotes' : 'quote_requests';
    const { data: order, error: orderError } = await supabase
      .from(tableName)
      .select('*, profiles!user_id(email, display_name)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    // Get customer email
    const customerEmail = order.profiles?.email;
    if (!customerEmail) {
      console.warn(`No customer email found for order ${orderId}`);
      return new Response(JSON.stringify({ success: true, message: 'No customer email' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get admin emails
    const { data: adminSettings } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_emails')
      .single();

    const adminEmails = adminSettings?.setting_value || {
      primary: 'admin@openteknologies.com',
      secondary: ['orders@openteknologies.com']
    };

    // Prepare email content
    const orderNumber = `#${orderId.slice(-8)}`;
    const customerName = order.profiles?.display_name || 'Customer';
    const statusMessage = statusMessages[status as keyof typeof statusMessages] || `Status updated to ${status}`;
    const statusEmoji = statusEmojis[status as keyof typeof statusEmojis] || '📋';

    // Customer notification email
    const customerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Status Update ${statusEmoji}</h2>
        <p>Hello ${customerName},</p>
        <p>Your order ${orderNumber} status has been updated.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #495057;">Status: ${status.toUpperCase()}</h3>
          <p style="margin: 0; font-size: 16px;">${statusMessage}</p>
          ${notes ? `<p style="margin: 10px 0 0 0; font-style: italic; color: #6c757d;">Note: ${notes}</p>` : ''}
        </div>

        <div style="background: #fff; border: 1px solid #dee2e6; padding: 15px; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0;">Order Details</h4>
          <p><strong>Order ID:</strong> ${orderNumber}</p>
          <p><strong>Product:</strong> ${order.product_details}</p>
          ${order.amount ? `<p><strong>Amount:</strong> £${order.amount}</p>` : ''}
        </div>

        <p style="margin-top: 20px;">
          Thank you for choosing OpenTeknologies. If you have any questions, 
          please don't hesitate to contact us.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
        <p style="color: #6c757d; font-size: 14px;">
          This is an automated message from OpenTeknologies Order Management System.
        </p>
      </div>
    `;

    // Admin notification email
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Status Changed - Admin Notification</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Order ${orderNumber}</h3>
          <p><strong>Status Change:</strong> ${previousStatus} → ${status}</p>
          <p><strong>Order Type:</strong> ${orderType}</p>
          <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>

        <div style="background: #fff; border: 1px solid #dee2e6; padding: 15px; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0;">Full Order Details</h4>
          <p><strong>Product:</strong> ${order.product_details}</p>
          ${order.amount ? `<p><strong>Amount:</strong> £${order.amount}</p>` : ''}
          ${order.quantity ? `<p><strong>Quantity:</strong> ${order.quantity}</p>` : ''}
          ${order.materials ? `<p><strong>Materials:</strong> ${order.materials}</p>` : ''}
          ${order.dimensions ? `<p><strong>Dimensions:</strong> ${order.dimensions}</p>` : ''}
        </div>
      </div>
    `;

    // Send customer notification
    const customerEmailResult = await resend.emails.send({
      from: 'OpenTeknologies <orders@openteknologies.com>',
      to: [customerEmail],
      subject: `Order ${orderNumber} Status Update - ${statusMessage}`,
      html: customerEmailContent,
    });

    // Send admin notifications
    const adminEmailAddresses = [
      adminEmails.primary,
      ...(adminEmails.secondary || [])
    ].filter(Boolean);

    const adminEmailPromises = adminEmailAddresses.map(email => 
      resend.emails.send({
        from: 'OpenTeknologies System <system@openteknologies.com>',
        to: [email],
        subject: `[ADMIN] Order ${orderNumber} Status: ${status.toUpperCase()}`,
        html: adminEmailContent,
      })
    );

    const adminEmailResults = await Promise.allSettled(adminEmailPromises);

    console.log('Customer email result:', customerEmailResult);
    console.log('Admin email results:', adminEmailResults);

    // Log the notification
    await supabase.from('audit_logs').insert({
      user_id: order.user_id,
      action: 'order_status_notification_sent',
      action_details: {
        order_id: orderId,
        order_type: orderType,
        status_change: `${previousStatus} -> ${status}`,
        customer_email: customerEmail,
        admin_emails: adminEmailAddresses,
        notes
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Status change notifications sent successfully',
      customerEmailSent: customerEmailResult.error ? false : true,
      adminEmailsSent: adminEmailResults.filter(result => result.status === 'fulfilled').length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in order-status-notifications:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error occurred',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);