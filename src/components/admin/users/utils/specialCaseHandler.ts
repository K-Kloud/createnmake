
import { supabase } from "@/integrations/supabase/client";
import { checkIfUserIsAlreadyAdmin, addAdminRoleToDatabase } from "./adminRoleUtils";

export const handleSpecialAdminCase = async (
  emailOrUsername: string, 
  currentUserEmail: string | undefined, 
  currentUserId: string, 
  role: "admin" | "super_admin"
): Promise<{ userId: string } | null> => {
  // Special case for kalux2@gmail.com - they can add themselves as super admin
  if (emailOrUsername === "kalux2@gmail.com" && currentUserEmail === "kalux2@gmail.com") {
    // Check if they're already an admin
    const isAlreadyAdmin = await checkIfUserIsAlreadyAdmin(currentUserId);

    if (isAlreadyAdmin) {
      throw new Error("User is already an admin");
    }

    await addAdminRoleToDatabase(currentUserId, role);
    return { userId: currentUserId };
  }

  return null;
};
