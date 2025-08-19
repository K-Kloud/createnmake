export const cleanupAuthState = () => {
  // Clear any cached auth state
  localStorage.removeItem('auth-state');
  localStorage.removeItem('user-preferences');
  
  // Clear any expired tokens or session data
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('sb-') || key.startsWith('supabase')) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          // Remove if expired or invalid
          if (parsed.expires_at && new Date(parsed.expires_at * 1000) < new Date()) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Remove if can't parse
        localStorage.removeItem(key);
      }
    }
  });
};

export const isAuthenticated = () => {
  // Check if user has valid authentication
  const authKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('sb-') && key.includes('auth-token')
  );
  
  return authKeys.length > 0;
};