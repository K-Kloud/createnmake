
/**
 * Utility functions for generating and handling usernames
 */

export const generateUsernameFromEmail = (email: string): string => {
  if (!email) return 'User';
  
  // Extract the part before @ symbol
  const emailPrefix = email.split('@')[0];
  
  // Clean up the prefix (remove dots, numbers at the end, etc.)
  const cleanPrefix = emailPrefix
    .replace(/[._-]/g, '') // Remove dots, underscores, dashes
    .replace(/\d+$/, ''); // Remove trailing numbers
  
  // Ensure it's not empty after cleaning
  if (cleanPrefix.length === 0) {
    return 'User';
  }
  
  // Capitalize first letter
  return cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1);
};

export const getFallbackUsername = (username: string | null, email?: string, userId?: string): string => {
  // If username exists, use it
  if (username && username.trim()) {
    return username;
  }
  
  // If email exists, generate username from email
  if (email) {
    return generateUsernameFromEmail(email);
  }
  
  // If userId exists, use a shortened version
  if (userId) {
    return `User${userId.slice(0, 8)}`;
  }
  
  // Final fallback
  return 'Anonymous User';
};
