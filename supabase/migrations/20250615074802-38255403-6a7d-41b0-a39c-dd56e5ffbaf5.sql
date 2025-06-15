
-- Add deleted_at column for soft-delete functionality on notifications
ALTER TABLE public.user_notifications
ADD COLUMN deleted_at timestamp with time zone;

-- Optionally, backfill deleted_at to null for existing rows (should be default)
UPDATE public.user_notifications SET deleted_at = NULL WHERE deleted_at IS NULL;

-- For optimal future real-time update support, make sure REPLICA IDENTITY is set to FULL (optional for realtime features, but helpful)
ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;
