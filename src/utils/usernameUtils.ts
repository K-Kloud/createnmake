
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
  console.log('🔍 getFallbackUsername called with:', { username, email, userId });
  
  // If username exists, use it
  if (username && username.trim()) {
    console.log('✅ Using existing username:', username);
    return username;
  }
  
  // If email exists, generate username from email
  if (email) {
    const generatedName = generateUsernameFromEmail(email);
    console.log('✅ Generated username from email:', generatedName);
    return generatedName;
  }
  
  // If userId exists, use a shortened version with better formatting
  if (userId) {
    const shortId = userId.slice(-8); // Take last 8 characters
    const formattedName = `User_${shortId}`;
    console.log('✅ Generated username from userId:', formattedName);
    return formattedName;
  }
  
  // Final fallback
  console.log('⚠️ Using final fallback: Anonymous User');
  return 'Anonymous User';
};
