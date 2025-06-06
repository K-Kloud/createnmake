
import { supabase } from "@/integrations/supabase/client";
import { sanitizeHtml, isValidEmail, isValidUsername } from "@/utils/security";
import { logAdminOperation } from "./auditLogUtils";

/**
 * Safely find user by email or username with enhanced validation and XSS protection
 */
export const findUserSecurely = async (emailOrUsername: string): Promise<string | null> => {
  // Input validation and sanitization
  if (!emailOrUsername || typeof emailOrUsername !== 'string') {
    throw new Error("Invalid input: email or username must be a non-empty string");
  }

  if (emailOrUsername.length < 3 || emailOrUsername.length > 254) {
    throw new Error("Invalid input: email or username must be between 3 and 254 characters");
  }

  // Sanitize input to prevent XSS
  const sanitizedInput = sanitizeHtml(emailOrUsername.trim().toLowerCase());
  
  // Additional validation for suspicious patterns
  if (/[<>{}()\[\]\\\/]/.test(sanitizedInput)) {
    throw new Error("Invalid characters detected in input");
  }

  try {
    // Check if it's a valid email format
    const isEmail = isValidEmail(sanitizedInput);
    
    if (isEmail) {
      // For email lookup, search profiles by username (which might contain email)
      const { data: userByEmail } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", sanitizedInput)
        .maybeSingle();

      if (userByEmail) {
        return userByEmail.id;
      }
    } else {
      // Validate username format
      if (!isValidUsername(sanitizedInput)) {
        throw new Error("Invalid username format");
      }
    }

    // Try to find by username with case-insensitive search
    const { data: userByUsername } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", sanitizedInput)
      .maybeSingle();

    if (userByUsername) {
      return userByUsername.id;
    }

    return null;
  } catch (error) {
    console.error("Error finding user:", error);
    await logAdminOperation("user_lookup_error", sanitizedInput, "unknown", false, { error: error.message });
    return null;
  }
};
