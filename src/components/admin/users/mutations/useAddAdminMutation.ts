
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { checkIfSuperAdmin, findUserByEmailOrUsername, checkIfUserIsAlreadyAdmin, addAdminRoleToDatabase } from "../utils/adminRoleUtils";
import { handleSpecialAdminCase } from "../utils/specialCaseHandler";

export const useAddAdminMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailOrUsername, role }: { emailOrUsername: string; role: "admin" | "super_admin" }) => {
      // Get current session to check permissions
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to add admins");
      }

      const currentUserId = session.session.user.id;
      const currentUserEmail = session.session.user.email;

      // Handle special case first
      const specialCaseResult = await handleSpecialAdminCase(
        emailOrUsername, 
        currentUserEmail, 
        currentUserId, 
        role
      );

      if (specialCaseResult) {
        return specialCaseResult;
      }

      // For all other cases, check if current user is super admin
      const isCurrentUserSuperAdmin = await checkIfSuperAdmin(currentUserId);
      
      if (!isCurrentUserSuperAdmin) {
        throw new Error("Only super admins can add other admins");
      }

      // Find the target user
      const targetUserId = await findUserByEmailOrUsername(emailOrUsername);

      if (!targetUserId) {
        throw new Error(`No user found with email/username: ${emailOrUsername}. Make sure the user has registered and has a profile.`);
      }

      // Check if user is already an admin
      const isAlreadyAdmin = await checkIfUserIsAlreadyAdmin(targetUserId);

      if (isAlreadyAdmin) {
        throw new Error("User is already an admin");
      }

      await addAdminRoleToDatabase(targetUserId, role);
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
