-- Lock down the raw payout function
REVOKE EXECUTE ON FUNCTION public.process_maker_payout(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_maker_payout(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.process_maker_payout(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_maker_payout(uuid) TO service_role;

-- Admin-only wrapper for callers that need to invoke a payout from a logged-in session
CREATE OR REPLACE FUNCTION public.admin_process_maker_payout(p_maker_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin','super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;

  -- Audit the admin-triggered payout
  INSERT INTO public.audit_logs (user_id, action, action_details)
  VALUES (
    auth.uid(),
    'admin_process_maker_payout',
    jsonb_build_object('maker_id', p_maker_id, 'triggered_at', now())
  );

  RETURN public.process_maker_payout(p_maker_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_process_maker_payout(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_process_maker_payout(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_process_maker_payout(uuid) TO authenticated;