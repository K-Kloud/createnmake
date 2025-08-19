/**
 * Core Security Module
 * Provides comprehensive security utilities and protections
 */

import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

// Security event types
export type SecurityEvent = 
  | 'csrf_token_mismatch'
  | 'xss_attempt'
  | 'sql_injection_attempt'
  | 'rate_limit_exceeded'
  | 'unauthorized_access'
  | 'suspicious_activity'
  | 'data_leak_attempt';

// CSRF Protection
class CSRFProtection {
  private static instance: CSRFProtection;
  private token: string | null = null;
  private readonly STORAGE_KEY = 'csrf_token';

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(this.STORAGE_KEY, this.token);
    return this.token;
  }

  getToken(): string {
    if (!this.token) {
      this.token = sessionStorage.getItem(this.STORAGE_KEY);
      if (!this.token) {
        return this.generateToken();
      }
    }
    return this.token;
  }

  validateToken(receivedToken: string): boolean {
    const storedToken = this.getToken();
    return storedToken === receivedToken && receivedToken.length === 64;
  }

  clearToken(): void {
    this.token = null;
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}

// Enhanced Input Sanitization
export class InputSanitizer {
  // XSS Prevention patterns
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /data:application\/.*javascript/gi
  ];

  // SQL Injection patterns
  private static readonly SQL_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(;|\||&|\$|\`)/g,
    /(\b(OR|AND)\b.*=.*)/gi
  ];

  static sanitizeForHTML(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Check for XSS patterns
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(input)) {
        this.logSecurityEvent('xss_attempt', { input: input.substring(0, 100) });
        return '';
      }
    }

    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: [],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onclick', 'onerror', 'onload']
    });
  }

  static sanitizeForSQL(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Check for SQL injection patterns
    for (const pattern of this.SQL_PATTERNS) {
      if (pattern.test(input)) {
        this.logSecurityEvent('sql_injection_attempt', { input: input.substring(0, 100) });
        return '';
      }
    }

    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private static async logSecurityEvent(event: SecurityEvent, details: Record<string, any>) {
    try {
      // Use audit_logs table for security events until security_events is available in types
      await supabase.from('audit_logs').insert({
        action: `security_${event}`,
        action_details: {
          event_type: event,
          details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_address: 'client-side',
          severity: event.includes('injection') || event.includes('xss') ? 'high' : 'medium'
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

// Rate Limiting
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 10, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      InputSanitizer['logSecurityEvent']('rate_limit_exceeded', { key, attempts: validAttempts.length });
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Security Headers Manager
export class SecurityHeaders {
  static getSecureHeaders(): Record<string, string> {
    const csrf = CSRFProtection.getInstance();
    
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-src https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; '),
      'X-CSRF-Token': csrf.getToken()
    };
  }

  static applyCspMeta(): void {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = this.getSecureHeaders()['Content-Security-Policy'];
    document.head.appendChild(meta);
  }
}

// Secure Storage
export class SecureStorage {
  private static readonly PREFIX = 'sec_';
  
  static setItem(key: string, value: string, encrypt = false): void {
    const secureKey = this.PREFIX + key;
    
    if (encrypt) {
      // Simple encoding for client-side (not true encryption)
      const encoded = btoa(encodeURIComponent(value));
      sessionStorage.setItem(secureKey, encoded);
    } else {
      sessionStorage.setItem(secureKey, value);
    }
  }

  static getItem(key: string, decrypt = false): string | null {
    const secureKey = this.PREFIX + key;
    const value = sessionStorage.getItem(secureKey);
    
    if (!value) return null;
    
    if (decrypt) {
      try {
        return decodeURIComponent(atob(value));
      } catch {
        return null;
      }
    }
    
    return value;
  }

  static removeItem(key: string): void {
    const secureKey = this.PREFIX + key;
    sessionStorage.removeItem(secureKey);
  }

  static clear(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }
}

// Export instances
export const csrf = CSRFProtection.getInstance();
export const rateLimiter = new ClientRateLimiter();

// Initialize security on module load
SecurityHeaders.applyCspMeta();