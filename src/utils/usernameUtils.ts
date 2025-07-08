
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

export const getFallbackUsername = (
  username: string | null, 
  email?: string, 
  userId?: string,
  displayName?: string | null,
  firstName?: string | null,
  lastName?: string | null
): string => {
  console.log('🔍 getFallbackUsername called with:', { username, email, userId, displayName, firstName, lastName });
  
  // Priority 1: Use username if it exists
  if (username && username.trim()) {
    console.log('✅ Using existing username:', username);
    return username;
  }
  
  // Priority 2: Use display_name if it exists
  if (displayName && displayName.trim()) {
    console.log('✅ Using display name:', displayName);
    return displayName;
  }
  
  // Priority 3: Use first_name + last_name combination
  if (firstName && firstName.trim()) {
    const fullName = lastName && lastName.trim() 
      ? `${firstName} ${lastName}` 
      : firstName;
    console.log('✅ Using first/last name:', fullName);
    return fullName;
  }
  
  // Priority 4: If email exists, generate username from email
  if (email) {
    const generatedName = generateUsernameFromEmail(email);
    console.log('✅ Generated username from email:', generatedName);
    return generatedName;
  }
  
  // Priority 5: If userId exists, use a shortened version with better formatting
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
