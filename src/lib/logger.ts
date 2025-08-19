// Production-ready logging system to replace console.log usage
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  maxLocalEntries: number;
}

class Logger {
  private config: LoggerConfig;
  private localEntries: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: process.env.NODE_ENV === 'development',
      enableRemote: process.env.NODE_ENV === 'production',
      maxLocalEntries: 1000,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from session/auth context
    try {
      // This would be implemented based on your auth system
      return undefined;
    } catch {
      return undefined;
    }
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const prefix = `[${entry.level}] ${entry.timestamp}`;
    const contextStr = entry.context ? ` [${entry.context}]` : '';
    const message = `${prefix}${contextStr} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data || '');
        break;
    }
  }

  private storeLocally(entry: LogEntry): void {
    this.localEntries.push(entry);
    if (this.localEntries.length > this.config.maxLocalEntries) {
      this.localEntries.shift();
    }
  }

  private async logRemotely(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote) return;

    try {
      // Implementation would depend on your logging service
      // For now, just store locally
      this.storeLocally(entry);
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Failed to log remotely:', error);
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, data);
    
    this.logToConsole(entry);
    this.logRemotely(entry);
  }

  debug(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  // Utility methods for common logging patterns
  componentRender(componentName: string, props?: Record<string, unknown>): void {
    this.debug(`Component rendered`, componentName, props);
  }

  apiCall(endpoint: string, method: string, params?: Record<string, unknown>): void {
    this.info(`API call: ${method} ${endpoint}`, 'API', params);
  }

  userAction(action: string, userId?: string, data?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, 'USER', { userId, ...data });
  }

  performance(operation: string, duration: number, metadata?: Record<string, unknown>): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    this.log(level, `Performance: ${operation} took ${duration}ms`, 'PERF', metadata);
  }

  // Get stored log entries for debugging
  getLocalEntries(): LogEntry[] {
    return [...this.localEntries];
  }

  // Clear local entries
  clearLocalEntries(): void {
    this.localEntries = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common use cases
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  componentRender: logger.componentRender.bind(logger),
  apiCall: logger.apiCall.bind(logger),
  userAction: logger.userAction.bind(logger),
  performance: logger.performance.bind(logger),
};