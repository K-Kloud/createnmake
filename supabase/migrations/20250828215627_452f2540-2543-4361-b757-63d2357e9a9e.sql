-- Create function to send make order notifications
CREATE OR REPLACE FUNCTION public.notify_make_order_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  order_type TEXT;
  order_data JSONB;
  notification_result JSONB;
BEGIN
  -- Determine order type based on table
  IF TG_TABLE_NAME = 'artisan_quotes' THEN
    order_type := 'artisan';
    order_data := row_to_json(NEW)::jsonb;
  ELSIF TG_TABLE_NAME = 'quote_requests' THEN
    order_type := 'manufacturer';
    order_data := row_to_json(NEW)::jsonb;
  ELSE
    RAISE EXCEPTION 'Unknown table for order notifications: %', TG_TABLE_NAME;
  END IF;

  -- Call the edge function to send email notifications
  BEGIN
    SELECT extensions.http_post(
      url => 'https://igkiffajkpfwdfxwokwg.supabase.co/functions/v1/make-order-notifications',
      headers => jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body => jsonb_build_object(
        'orderType', order_type,
        'orderId', NEW.id::text,
        'orderData', order_data
      )
    ) INTO notification_result;
    
    -- Log successful notification attempt
    INSERT INTO audit_logs (
      user_id,
      action,
      action_details
    ) VALUES (
      NEW.user_id,
      'make_order_notification_sent',
      jsonb_build_object(
        'order_type', order_type,
        'order_id', NEW.id,
        'notification_result', notification_result
      )
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Log notification failure but don't block order creation
    INSERT INTO audit_logs (
      user_id,
      action,
      action_details
    ) VALUES (
      NEW.user_id,
      'make_order_notification_failed',
      jsonb_build_object(
        'order_type', order_type,
        'order_id', NEW.id,
        'error', SQLERRM
      )
    );
    
    -- Don't raise the error to avoid blocking order creation
    RAISE WARNING 'Failed to send order notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Create triggers for artisan quotes
DROP TRIGGER IF EXISTS trigger_artisan_order_notifications ON artisan_quotes;
CREATE TRIGGER trigger_artisan_order_notifications
  AFTER INSERT ON artisan_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_make_order_created();

-- Create triggers for manufacturer quote requests
DROP TRIGGER IF EXISTS trigger_manufacturer_order_notifications ON quote_requests;
CREATE TRIGGER trigger_manufacturer_order_notifications
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_make_order_created();

-- Add service role key setting for edge function calls
-- This will be used by the function to authenticate with edge functions
ALTER DATABASE postgres SET app.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2lmZmFqa3Bmd2RmeHdva3dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc1NTgzMCwiZXhwIjoyMDQ5MzMxODMwfQ.0qmsiQRy7fy6CqTxZXQ2_WCw4oOILaD6TnN0wEQ3vcs';