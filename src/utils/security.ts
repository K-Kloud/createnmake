
// Security utilities for input validation and sanitization
import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  // Enhanced sanitization to prevent XSS attacks
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially harmful characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>{}()\[\]\\\/]/g, '')
    .trim()
    .substring(0, 10000); // Limit length to prevent DoS
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
}

export function escapeHtml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitize HTML content using DOMPurify to prevent XSS attacks
 * This should be used for any user-generated content that needs to preserve HTML formatting
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Configure DOMPurify with strict settings
  const cleanHtml = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe', 'meta', 'link'],
    FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload', 'onmouseover'],
    USE_PROFILES: { html: true }
  });
  
  return cleanHtml;
}

/**
 * Sanitize content for admin use with more permissive settings
 * Only use this for trusted admin content
 */
export function sanitizeAdminHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a', 'img', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'src', 'alt', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe', 'meta', 'link', 'style'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
    USE_PROFILES: { html: true }
  });
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
