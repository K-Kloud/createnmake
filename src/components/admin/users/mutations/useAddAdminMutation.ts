
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { findUserSecurely, logAdminOperation, validateAdminMutation } from "../utils/secureAdminUtils";

export const useAddAdminMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailOrUsername, role }: { emailOrUsername: string; role: "admin" | "super_admin" }) => {
      // Validate the admin mutation
      await validateAdminMutation("pending", "add");

      // Find the target user securely
      const targetUserId = await findUserSecurely(emailOrUsername);

      if (!targetUserId) {
        await logAdminOperation("add_attempt", emailOrUsername, role, false, { reason: "user_not_found" });
        throw new Error(`No user found with email/username: ${emailOrUsername}. Make sure the user has registered and has a profile.`);
      }

      // Validate the specific target user
      await validateAdminMutation(targetUserId, "add");

      // Check if user is already an admin
      const { data: existingRole } = await supabase
        .from("admin_roles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (existingRole) {
        await logAdminOperation("add_attempt", targetUserId, role, false, { reason: "already_admin" });
        throw new Error("User is already an admin");
      }

      // Add admin role using the RPC function
      const { error: rpcError } = await supabase.rpc('add_admin_role' as any, {
        target_user_id: targetUserId,
        admin_role: role
      });

      if (rpcError) {
        // Fallback to direct insert if RPC fails
        const { error: insertError } = await supabase
          .from("admin_roles")
          .insert([{ user_id: targetUserId, role: role }]);

        if (insertError) {
          await logAdminOperation("add", targetUserId, role, false, { error: insertError.message });
          throw insertError;
        }
      }

      // Log successful operation
      await logAdminOperation("add", targetUserId, role, true);
      
      return { userId: targetUserId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Success",
        description: "Admin role added successfully",
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
