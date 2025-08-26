-- Enable real-time for order tables
ALTER TABLE artisan_quotes REPLICA IDENTITY FULL;
ALTER TABLE quote_requests REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE artisan_quotes;
ALTER publication supabase_realtime ADD TABLE quote_requests;