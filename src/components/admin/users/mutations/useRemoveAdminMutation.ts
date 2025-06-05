
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { checkCurrentUserIsSuperAdmin, logAdminOperation } from "../utils/secureAdminUtils";

export const useRemoveAdminMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Check if current user is super_admin before allowing removal
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to remove admins");
      }
      
      const isCurrentUserSuperAdmin = await checkCurrentUserIsSuperAdmin();
      
      // Check if target user is super_admin
      const { data: targetUserRole } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
        
      if (targetUserRole?.role === "super_admin") {
        await logAdminOperation("remove_attempt", userId, "super_admin", false);
        throw new Error("Super admins cannot be removed");
      }
      
      if (!isCurrentUserSuperAdmin) {
        await logAdminOperation("remove_attempt", userId, targetUserRole?.role || "unknown", false);
        throw new Error("Only super admins can remove other admins");
      }

      // Prevent self-removal
      if (session.session.user.id === userId) {
        await logAdminOperation("remove_attempt", userId, targetUserRole?.role || "unknown", false);
        throw new Error("You cannot remove your own admin role");
      }

      const { error } = await supabase
        .from("admin_roles")
        .delete()
        .eq("user_id", userId);

      if (error) {
        await logAdminOperation("remove", userId, targetUserRole?.role || "unknown", false);
        throw error;
      }

      // Log successful operation
      await logAdminOperation("remove", userId, targetUserRole?.role || "unknown", true);
      
      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Success",
        description: "Admin role removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
