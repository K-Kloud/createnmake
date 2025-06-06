
/**
 * Enhanced security utility functions for input validation and sanitization
 */

/**
 * Comprehensive HTML sanitization to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/url\s*\(/gi, '')
    .replace(/&#/g, '')
    .replace(/&\w+;/g, '');
};

/**
 * Validate email format with enhanced security checks
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email) && 
         email.length <= 254 && 
         email.length >= 5 &&
         !email.includes('..') && // Prevent consecutive dots
         !email.startsWith('.') && 
         !email.endsWith('.');
};

/**
 * Validate username format (alphanumeric, underscore, hyphen only)
 */
export const isValidUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') return false;
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(username) && 
         username.length >= 3 && 
         username.length <= 50 &&
         !username.startsWith('-') &&
         !username.endsWith('-');
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Enhanced rate limiting utility with memory cleanup
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(time => now - time < this.windowMs);
      if (validAttempts.length === 0) {
        this.attempts.delete(identifier);
      } else {
        this.attempts.set(identifier, validAttempts);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.attempts.clear();
  }
}

/**
 * CSRF token generation and validation
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Secure session storage with encryption-like obfuscation
 */
export const secureStorage = {
  set: (key: string, value: any): void => {
    try {
      const obfuscated = btoa(JSON.stringify(value));
      sessionStorage.setItem(`sec_${key}`, obfuscated);
    } catch (error) {
      console.error('Failed to store secure data:', error);
    }
  },
  
  get: (key: string): any => {
    try {
      const stored = sessionStorage.getItem(`sec_${key}`);
      if (!stored) return null;
      return JSON.parse(atob(stored));
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  },
  
  remove: (key: string): void => {
    sessionStorage.removeItem(`sec_${key}`);
  }
};

/**
 * Content Security Policy helper
 */
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};

/**
 * Input sanitization for different contexts
 */
export const sanitizers = {
  text: (input: string): string => {
    return sanitizeHtml(input).trim();
  },
  
  numeric: (input: string): string => {
    return input.replace(/[^0-9.-]/g, '');
  },
  
  alphanumeric: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9]/g, '');
  },
  
  filename: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9._-]/g, '').substring(0, 255);
  }
};
