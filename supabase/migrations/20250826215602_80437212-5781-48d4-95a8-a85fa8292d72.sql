-- Safely add artisan_quotes to realtime publication if not already there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'artisan_quotes'
  ) THEN
    ALTER publication supabase_realtime ADD TABLE artisan_quotes;
  END IF;
END $$;