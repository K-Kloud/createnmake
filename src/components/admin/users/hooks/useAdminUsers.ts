
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser, AdminRole, Profile, SupabaseAuthResponse } from "../types";

export const useAdminUsers = () => {
  return useQuery<AdminUser[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
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
