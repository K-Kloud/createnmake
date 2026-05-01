// Shared server-side authorization helpers for sensitive endpoints.
// Use `requireAdmin` for financial/payout/admin-only routes.
// Use `requireAuthenticatedUser` for self-service routes that just need a logged-in caller.

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.47.3';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

async function logDenial(
  functionName: string,
  reason: string,
  userId: string | null,
) {
  try {
    const supabase = getServiceClient();
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'admin_endpoint_denied',
      action_details: { function: functionName, reason },
    });
  } catch (_e) {
    // Never let audit failures block the response
  }
}

export type AdminAuthOk = {
  ok: true;
  userId: string | null;
  viaCron: boolean;
  supabase: SupabaseClient;
};
export type AdminAuthFail = { ok: false; response: Response };
export type AdminAuthResult = AdminAuthOk | AdminAuthFail;

/**
 * Require an admin / super_admin user, OR a valid CRON_SECRET bearer token.
 * Returns either { ok: true, ... } or { ok: false, response } — caller returns the response.
 */
export async function requireAdmin(
  req: Request,
  functionName: string,
): Promise<AdminAuthResult> {
  const supabase = getServiceClient();
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    await logDenial(functionName, 'missing_token', null);
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401) };
  }

  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret && token === cronSecret) {
    return { ok: true, userId: null, viaCron: true, supabase };
  }

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData?.user) {
    await logDenial(functionName, 'invalid_jwt', null);
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401) };
  }

  const userId = userData.user.id;
  const { data: roleRow } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['admin', 'super_admin'])
    .maybeSingle();

  if (!roleRow) {
    await logDenial(functionName, 'not_admin', userId);
    return { ok: false, response: jsonResponse({ error: 'Forbidden: admin required' }, 403) };
  }

  return { ok: true, userId, viaCron: false, supabase };
}

export type UserAuthOk = { ok: true; userId: string; supabase: SupabaseClient };
export type UserAuthResult = UserAuthOk | AdminAuthFail;

/**
 * Require any authenticated user. Use for self-service endpoints
 * (checkout, customer portal, subscription check, etc.).
 */
export async function requireAuthenticatedUser(
  req: Request,
  functionName: string,
): Promise<UserAuthResult> {
  const supabase = getServiceClient();
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    await logDenial(functionName, 'missing_token', null);
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401) };
  }

  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData?.user) {
    await logDenial(functionName, 'invalid_jwt', null);
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401) };
  }

  return { ok: true, userId: userData.user.id, supabase };
}
