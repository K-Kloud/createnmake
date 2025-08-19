// TypeScript cleanup utilities
export const migrateConsoleToLogger = (componentName: string) => {
  // Migration helper for components still using console.log
  return `Replace console.log usage in ${componentName} with log.debug/info/warn/error from @/lib/logger`;
};

export const validateStrictTypes = () => {
  // Utility to help identify remaining any types
  console.warn('🔍 Check for remaining any types in components');
};

// Common type guards
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};