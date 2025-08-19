// Console cleanup utility - Replace console.log with production-safe logging
import { ProductionLogger } from '@/lib/performance';

// Export production-safe logger to replace console usage throughout the app
export const debugLog = ProductionLogger.log;
export const debugWarn = ProductionLogger.warn;
export const debugError = ProductionLogger.error;
export const debugInfo = ProductionLogger.info;
export const debugDebug = ProductionLogger.debug;

// Migration helper - use this to identify remaining console.log usage
export const logMigrationWarning = (location: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`🔄 Console.log found in ${location} - consider migrating to ProductionLogger`);
  }
};

// Quick replacement functions for common console patterns
export const logState = (componentName: string, state: any) => {
  ProductionLogger.debug(`[${componentName}] State:`, state);
};

export const logAction = (componentName: string, action: string, data?: any) => {
  ProductionLogger.debug(`[${componentName}] ${action}:`, data);
};

export const logError = (componentName: string, error: any, context?: string) => {
  ProductionLogger.error(`[${componentName}] ${context || 'Error'}:`, error);
};

export const logPerformance = (operation: string, duration: number) => {
  if (duration > 100) {
    ProductionLogger.warn(`🐌 Slow operation: ${operation} took ${duration.toFixed(2)}ms`);
  } else {
    ProductionLogger.debug(`⚡ ${operation}: ${duration.toFixed(2)}ms`);
  }
};