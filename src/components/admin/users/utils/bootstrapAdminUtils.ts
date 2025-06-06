
import { supabase } from "@/integrations/supabase/client";
import { logAdminOperation } from "./auditLogUtils";

/**
 * Secure function to bootstrap the first super admin
 * This should only be used during initial setup
 */
export const bootstrapSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Check if any super admin already exists
    const { data: existingSuperAdmin } = await supabase
      .from("admin_roles")
      .select("user_id")
      .eq("role", "super_admin")
      .maybeSingle();

    if (existingSuperAdmin) {
      throw new Error("Super admin already exists. Cannot bootstrap another one.");
    }

    // Add the first super admin
    const { error } = await supabase
      .from("admin_roles")
      .insert([{ user_id: userId, role: "super_admin" }]);

    if (error) throw error;

    await logAdminOperation("bootstrap_super_admin", userId, "super_admin", true);
    return true;
  } catch (error) {
    console.error("Error bootstrapping super admin:", error);
    await logAdminOperation("bootstrap_super_admin_failed", userId, "super_admin", false, { error: error.message });
    return false;
  }
};
