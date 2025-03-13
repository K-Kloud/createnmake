
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser, AdminRole, Profile, SupabaseAuthResponse } from "../types";

export const useAdminUsers = () => {
  return useQuery<AdminUser[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      // First check if kalux2@gmail.com is a super_admin
      await ensureSuperAdminExists();
      
      const { data: adminRoles, error: rolesError } = await supabase
        .from("admin_roles")
        .select("user_id, role, created_at");

      if (rolesError) throw rolesError;

      const userIds = adminRoles.map((role: AdminRole) => role.user_id);
      
      if (userIds.length === 0) return [];

      try {
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
          perPage: 1000,
        });

        if (usersError) throw usersError;

        return adminRoles.map((role: AdminRole) => {
          const user = (users as SupabaseAuthResponse).users.find((u) => u.id === role.user_id);
          return {
            id: role.user_id,
            email: user?.email || "Unknown",
            role: role.role,
            created_at: role.created_at,
          };
        });
      } catch (error) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        return adminRoles.map((role: AdminRole) => {
          const profile = profiles.find((p: Profile) => p.id === role.user_id);
          return {
            id: role.user_id,
            email: profile?.username || "Unknown",
            role: role.role,
            created_at: role.created_at,
          };
        });
      }
    },
  });
};

// Helper function to ensure kalux2@gmail.com is a super_admin
async function ensureSuperAdminExists() {
  try {
    // Check if kalux2@gmail.com exists in profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', 'kalux2@gmail.com')
      .single();
    
    let userId = profileData?.id;
    
    // If profile doesn't exist, create it
    if (!userId) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          username: 'kalux2@gmail.com'
        })
        .select('id')
        .single();
      
      if (newProfile) {
        userId = newProfile.id;
      }
    }
    
    if (userId) {
      // Check if user is already a super_admin
      const { data: existingRole } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'super_admin')
        .single();
      
      // If not a super_admin, add the role
      if (!existingRole) {
        await supabase
          .from('admin_roles')
          .upsert({
            user_id: userId,
            role: 'super_admin'
          });
      }
    }
  } catch (error) {
    console.error('Error ensuring super admin exists:', error);
  }
}
