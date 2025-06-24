
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced authentication utilities for robust session management
 */

/**
 * Comprehensive auth state cleanup to prevent authentication limbo
 */
export const enhancedAuthCleanup = () => {
  console.log("Performing enhanced auth cleanup...");
  
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
      console.log(`Removed localStorage key: ${key}`);
    }
  });
  
  // Remove from sessionStorage if in use
  try {
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
        console.log(`Removed sessionStorage key: ${key}`);
      }
    });
  } catch (e) {
    console.error("Error cleaning sessionStorage:", e);
  }

  // Clear any cached user data
  localStorage.removeItem('cached_user_data');
  localStorage.removeItem('user_preferences');
  
  console.log("Enhanced auth cleanup completed");
};

/**
 * Robust session refresh with fallback handling
 */
export const enhancedSessionRefresh = async () => {
  try {
    console.log("Attempting session refresh...");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session refresh error:", error);
      // If session refresh fails, clean up auth state
      enhancedAuthCleanup();
      return null;
    }
    
    if (data.session) {
      console.log("Session refreshed successfully");
      return data.session;
    } else {
      console.log("No active session found");
      enhancedAuthCleanup();
      return null;
    }
  } catch (error) {
    console.error("Exception during session refresh:", error);
    enhancedAuthCleanup();
    return null;
  }
};

/**
 * Enhanced sign out with comprehensive cleanup
 */
export const enhancedSignOut = async () => {
  try {
    console.log("Starting enhanced sign out process...");
    
    // Clean up auth state first
    enhancedAuthCleanup();
    
    // Attempt global sign out (fallback if it fails)
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log("Global sign out successful");
    } catch (err) {
      console.warn("Global sign out failed, continuing with local cleanup:", err);
    }
    
    // Additional cleanup for auth limbo prevention
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force page reload for a clean state
    console.log("Redirecting to clean state...");
    window.location.href = '/';
  } catch (error) {
    console.error("Error during enhanced sign out:", error);
    // Force cleanup even if sign out fails
    enhancedAuthCleanup();
    window.location.href = '/';
  }
};

/**
 * Enhanced sign in with proper state management
 */
export const enhancedSignIn = async (email: string, password: string) => {
  try {
    console.log("Starting enhanced sign in process...");
    
    // Clean up existing state first
    enhancedAuthCleanup();
    
    // Attempt global sign out to clear any existing sessions
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn("Pre-signin cleanup failed, continuing:", err);
    }
    
    // Wait a moment for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Sign in with email/password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error);
      return { error };
    }
    
    if (data.user && data.session) {
      console.log("Sign in successful");
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
      return { data };
    }
    
    return { error: new Error("Unknown sign in error") };
  } catch (error) {
    console.error("Exception during enhanced sign in:", error);
    return { error };
  }
};

/**
 * Enhanced sign up with proper redirect handling
 */
export const enhancedSignUp = async (email: string, password: string, metadata?: any) => {
  try {
    console.log("Starting enhanced sign up process...");
    
    // Clean up existing state first
    enhancedAuthCleanup();
    
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    
    if (error) {
      console.error("Sign up error:", error);
      return { error };
    }
    
    console.log("Sign up successful");
    return { data };
  } catch (error) {
    console.error("Exception during enhanced sign up:", error);
    return { error };
  }
};

/**
 * Check for authentication limbo state and resolve it
 */
export const checkAndResolveAuthLimbo = async () => {
  try {
    console.log("Checking for auth limbo state...");
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log("Session error detected, cleaning up auth state");
      enhancedAuthCleanup();
      return false;
    }
    
    if (!session) {
      console.log("No session found, ensuring clean state");
      enhancedAuthCleanup();
      return false;
    }
    
    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
      console.log("Expired session detected, cleaning up");
      enhancedAuthCleanup();
      return false;
    }
    
    console.log("Valid session found, no limbo state");
    return true;
  } catch (error) {
    console.error("Error checking auth limbo:", error);
    enhancedAuthCleanup();
    return false;
  }
};
