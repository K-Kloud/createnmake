## Goal

Add a single, dedicated server-side admin authorization check that all financial / payout edge functions reuse, instead of each function rolling its own auth logic (or none at all).

## Scope

**Financial / payout endpoints that must require admin (or a valid CRON_SECRET):**
- `process-maker-payouts` — triggers real maker payouts
- `payment-automation` — bulk payments, reconciliation, invoicing, retries via Stripe

**Endpoints that must require an authenticated user (the caller themselves), not admin:**
- `create-checkout` — caller buys for themselves
- `create-quote-payment` — caller pays their own quote
- `customer-portal` — caller manages own billing
- `check-subscription` — caller checks own sub

**Endpoints that stay public (signature-verified):**
- `webhook-stripe` — verified via Stripe signature, not JWT (no change)

**Database:**
- `process_maker_payout(p_maker_id)` is `SECURITY DEFINER` and currently callable by any authenticated user. Lock it down so only admins (or the service role) can execute it, defense-in-depth in case the edge layer is ever bypassed.

## Design

### 1. Shared auth helper

Create `supabase/functions/_shared/adminAuth.ts` exporting:

- `requireAdmin(req, supabase)` → returns `{ ok: true, userId, viaCron }` or a ready-to-return `Response` with 401/403.
  - Reads `Authorization: Bearer <token>`.
  - If `token === Deno.env.get('CRON_SECRET')` → ok via cron.
  - Else verifies the JWT via `supabase.auth.getUser(token)`, then checks `admin_roles` for role in (`admin`, `super_admin`).
  - On failure returns a sanitized 401/403 JSON response with `corsHeaders` already merged.
- `requireAuthenticatedUser(req, supabase)` → same flow but only requires a valid JWT (no admin check), returns `{ userId }`.
- Logs every denial to `audit_logs` (action: `admin_endpoint_denied`) with the function name and reason — without leaking token contents.

This replaces the inline auth blocks added previously to `process-maker-payouts` and `payment-automation`.

### 2. Apply the helper

- `process-maker-payouts/index.ts` — replace inline auth with `requireAdmin`.
- `payment-automation/index.ts` — replace inline auth with `requireAdmin`.
- `create-checkout`, `create-quote-payment`, `customer-portal`, `check-subscription` — wrap with `requireAuthenticatedUser` if any are missing JWT validation today (verify per-file during implementation; only add where absent).

### 3. Database: lock down `process_maker_payout`

Migration:

```text
REVOKE EXECUTE ON FUNCTION public.process_maker_payout(uuid) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.process_maker_payout(uuid) TO service_role;

-- Wrap with an admin-checking caller for any UI use
CREATE OR REPLACE FUNCTION public.admin_process_maker_payout(p_maker_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid() AND role IN ('admin','super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: admin required';
  END IF;
  RETURN public.process_maker_payout(p_maker_id);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_process_maker_payout(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_process_maker_payout(uuid) TO authenticated;
```

Edge functions (which use the service role) continue calling `process_maker_payout` directly. Any direct UI call must use `admin_process_maker_payout`.

### 4. Secret

Requires `CRON_SECRET` to be set as an edge function secret so scheduled jobs can call payout endpoints. After approval I will request it via the secrets tool.

## Outcome

- One canonical admin check used everywhere; no per-function reinvention.
- Anonymous and regular authenticated users get a clean 401/403 from financial endpoints.
- Even if an attacker reached the DB layer with a normal user JWT, `process_maker_payout` is no longer executable by them.
- Self-service billing endpoints still work for the signed-in customer.
- Stripe webhook stays open but signature-verified.