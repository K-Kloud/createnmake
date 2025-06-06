
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logAdminOperation, validateAdminMutation } from "../utils/secureAdminUtils";

export const useRemoveAdminMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Validate the admin mutation
      await validateAdminMutation(userId, "remove");
      
      // Check if target user is super_admin
      const { data: targetUserRole } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
        
      if (targetUserRole?.role === "super_admin") {
        await logAdminOperation("remove_attempt", userId, "super_admin", false, { reason: "cannot_remove_super_admin" });
        throw new Error("Super admins cannot be removed");
      }

      const { error } = await supabase
        .from("admin_roles")
        .delete()
        .eq("user_id", userId);

      if (error) {
        await logAdminOperation("remove", userId, targetUserRole?.role || "unknown", false, { error: error.message });
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
