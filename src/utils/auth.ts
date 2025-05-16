export const cleanupAuthState = () => {
  // Clear auth state from local storage
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('supabase.auth.token');
  
  // Clear any additional auth-related data
  const authKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('supabase.auth.') || key.includes('token') || key.includes('session')
  );
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
    }
  });
};
