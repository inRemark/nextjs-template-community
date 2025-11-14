
type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

interface LogOptions {
  emoji?: string;
  timestamp?: boolean;
}

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  
  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const parts: string[] = [];
    
    if (options?.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    
    if (options?.emoji) {
      parts.push(options.emoji);
    }
    
    parts.push(message);
    return parts.join(' ');
  }

  info(message: string, data?: unknown, options?: LogOptions) {
    const formatted = this.formatMessage('info', message, {
      emoji: options?.emoji || 'ℹ️',
      ...options,
    });
    
    if (this.isDevelopment) {
      console.warn(formatted); // use warn to make it visible in devtools
      if (data !== undefined) {
        console.warn(data);
      }
    }
  }

  success(message: string, data?: unknown, options?: LogOptions) {
    const formatted = this.formatMessage('success', message, {
      emoji: options?.emoji || '✅',
      ...options,
    });
    
    if (this.isDevelopment) {
      console.warn(formatted);
      if (data !== undefined) {
        console.warn(data);
      }
    }
  }

  warn(message: string, data?: unknown, options?: LogOptions) {
    const formatted = this.formatMessage('warn', message, {
      emoji: options?.emoji || '⚠️',
      ...options,
    });
    
    console.warn(formatted);
    if (data !== undefined) {
      console.warn(data);
    }
  }

  error(message: string, error?: unknown, options?: LogOptions) {
    const formatted = this.formatMessage('error', message, {
      emoji: options?.emoji || '❌',
      ...options,
    });
    
    console.error(formatted);
    if (error) {
      console.error(error);
    }
  }

  debug(message: string, data?: unknown, options?: LogOptions) {
    if (!this.isDevelopment) return;
    
    const formatted = this.formatMessage('debug', message, {
      emoji: options?.emoji || '🐛',
      ...options,
    });
    
    console.warn(formatted);
    if (data) {
      console.warn(data);
    }
  }

  /**
   * Table output (only in development)
   */
  table(data: unknown) {
    if (this.isDevelopment && Array.isArray(data)) {
      console.warn('📊 Data Table:');
      console.warn(data);
    }
  }

  /**
   * Group logs
   */
  group(label: string, callback: () => void) {
    if (this.isDevelopment) {
      console.warn(`📂 ${label}`);
      callback();
    }
  }
}

// Export singleton
export const logger = new Logger();

// Default export
export default logger;
