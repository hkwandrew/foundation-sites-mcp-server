/**
 * Logging utility for Foundation MCP Server
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, error?: Error | any, meta?: any): void {
    if (this.shouldLog('error')) {
      const errorMeta = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        ...meta,
      } : { error, ...meta };
      console.error(this.formatMessage('error', message, errorMeta));
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Export singleton instance
export const logger = new Logger(
  (process.env.MCP_LOG_LEVEL as LogLevel) || 'info'
);

export default logger;
