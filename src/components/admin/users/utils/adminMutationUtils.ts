
import { supabase } from "@/integrations/supabase/client";
import { validateAdminOperation } from "./rateLimitUtils";
import { checkCurrentUserIsSuperAdmin } from "./authRoleUtils";
import { logAdminOperation } from "./auditLogUtils";

/**
 * Enhanced security validation for admin mutations
 */
export const validateAdminMutation = async (targetUserId: string, operation: string): Promise<void> => {
  // Sanitize target user ID
  if (!targetUserId || typeof targetUserId !== 'string') {
    throw new Error("Invalid target user ID");
  }

  // Validate operation is allowed
  if (!await validateAdminOperation(operation)) {
    throw new Error("Admin operation validation failed");
  }

  // Check if current user is super admin
  const isSuperAdmin = await checkCurrentUserIsSuperAdmin();
  if (!isSuperAdmin) {
    await logAdminOperation(`${operation}_unauthorized`, targetUserId, "unknown", false);
    throw new Error("Only super admins can perform this operation");
  }

  // Prevent self-modification for critical operations
  const { data: session } = await supabase.auth.getSession();
  if (session?.session?.user?.id === targetUserId && ['remove', 'demote'].includes(operation)) {
    await logAdminOperation(`${operation}_self_attempt`, targetUserId, "unknown", false);
    throw new Error("You cannot perform this operation on your own account");
  }
};
