-- Create triggers for artisan quotes to send email notifications
DROP TRIGGER IF EXISTS trigger_artisan_order_notifications ON artisan_quotes;
CREATE TRIGGER trigger_artisan_order_notifications
  AFTER INSERT ON artisan_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_make_order_created();

-- Create triggers for manufacturer quote requests to send email notifications
DROP TRIGGER IF EXISTS trigger_manufacturer_order_notifications ON quote_requests;
CREATE TRIGGER trigger_manufacturer_order_notifications
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_make_order_created();