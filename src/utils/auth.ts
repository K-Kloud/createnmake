
/**
 * Utility functions for authentication
 */

/**
 * Cleans up auth state to prevent authentication limbo
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  try {
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error("Error cleaning sessionStorage:", e);
  }
};

/**
 * Refreshes the auth state by getting a new session
 */
export const refreshAuthState = async (supabaseClient: any) => {
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
  } catch (error) {
    console.error("Error refreshing auth state:", error);
    return null;
  }
};
