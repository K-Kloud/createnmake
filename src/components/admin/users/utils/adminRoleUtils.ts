
import { supabase } from "@/integrations/supabase/client";

export const checkIfSuperAdmin = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .single();
  
  return !!data;
};

export const findUserByEmailOrUsername = async (emailOrUsername: string): Promise<string | null> => {
  // First, try to find by email in auth.users via profiles
  const { data: userByEmail } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", emailOrUsername)
    .maybeSingle();

  if (userByEmail) {
    return userByEmail.id;
  }

  // Try to find by username in profiles
  const { data: userByUsername } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", emailOrUsername)
    .maybeSingle();

  if (userByUsername) {
    return userByUsername.id;
  }

  return null;
};

export const checkIfUserIsAlreadyAdmin = async (userId: string): Promise<boolean> => {
  const { data: existingRole } = await supabase
    .from("admin_roles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return !!existingRole;
};

export const addAdminRoleToDatabase = async (userId: string, role: "admin" | "super_admin"): Promise<void> => {
  // Try to use RPC function first, fallback to direct insert
  const { error: rpcError } = await supabase.rpc('add_admin_role' as any, {
    target_user_id: userId,
    admin_role: role
  });

  if (rpcError) {
    // Fallback to direct insert
    const { error: insertError } = await supabase
      .from("admin_roles")
      .insert([{ user_id: userId, role: role }]);

    if (insertError) throw insertError;
  }
};
