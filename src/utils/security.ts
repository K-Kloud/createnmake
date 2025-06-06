
// Security utilities for input validation and sanitization
export function sanitizeInput(input: string): string {
  // Remove any potentially harmful characters
  return input.replace(/[<>{}()\[\]\\\/]/g, '').trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Add the missing functions needed by other components
export function sanitizeHtml(input: string): string {
  return escapeHtml(input);
}

export function isValidEmail(email: string): boolean {
  return validateEmail(email);
}

export function isValidUsername(username: string): boolean {
  // Username requirements: 3-50 chars, alphanumeric, underscore, hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
}

// Rate limiter class for controlling frequency of operations
export class RateLimiter {
  private limits: Map<string, { count: number; resetTime: number }>;
  private maxRequests: number;
  private timeWindowMs: number;

  constructor(maxRequests: number, timeWindowMs: number) {
    this.limits = new Map();
    this.maxRequests = maxRequests;
    this.timeWindowMs = timeWindowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const userLimit = this.limits.get(key);

    // If no record exists or the reset time has passed, create a new record
    if (!userLimit || userLimit.resetTime < now) {
      this.limits.set(key, { count: 1, resetTime: now + this.timeWindowMs });
      return true;
    }

    // If under the limit, increment and allow
    if (userLimit.count < this.maxRequests) {
      userLimit.count += 1;
      return true;
    }

    // Rate limit exceeded
    return false;
  }

  reset(key: string): void {
    this.limits.delete(key);
  }
}
