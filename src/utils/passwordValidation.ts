
import { supabase } from "@/integrations/supabase/client";

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePasswordStrength = async (password: string): Promise<PasswordValidationResult> => {
  const errors: string[] = [];

  // Use the database function for validation
  try {
    const { data, error } = await supabase.rpc('validate_password_strength', { password });
    
    if (error) {
      console.error('Error validating password:', error);
      // Fallback to client-side validation
      return validatePasswordClient(password);
    }

    if (!data) {
      // Get specific errors for better UX
      return validatePasswordClient(password);
    }

    return { isValid: true, errors: [] };
  } catch (error) {
    console.error('Password validation error:', error);
    return validatePasswordClient(password);
  }
};

const validatePasswordClient = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordStrengthScore = (password: string): number => {
  let score = 0;
  
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  
  return Math.min(score, 100);
};

export const getPasswordStrengthLabel = (score: number): string => {
  if (score < 40) return 'Weak';
  if (score < 70) return 'Fair';
  if (score < 90) return 'Good';
  return 'Strong';
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score < 40) return 'bg-red-500';
  if (score < 70) return 'bg-yellow-500';
  if (score < 90) return 'bg-blue-500';
  return 'bg-green-500';
};
