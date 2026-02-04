/**
 * Centralized logging utility for conditional debug logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: Date;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, context?: string, data?: unknown) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date()
    };

    const prefix = context ? `[${context}]` : '';
    const formattedMessage = `${prefix} ${message}`;

    switch (level) {
      case 'debug':
        console.log(`🔍 ${formattedMessage}`, data || '');
        break;
      case 'info':
        console.info(`ℹ️ ${formattedMessage}`, data || '');
        break;
      case 'warn':
        console.warn(`⚠️ ${formattedMessage}`, data || '');
        break;
      case 'error':
        console.error(`❌ ${formattedMessage}`, data || '');
        break;
    }
  }

  debug(message: string, context?: string, data?: unknown) {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: unknown) {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: unknown) {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: unknown) {
    this.log('error', message, context, data);
  }

  // Game-specific logging methods
  gameAction(action: string, playerName?: string, data?: unknown) {
    this.debug(`Game: ${action}`, 'GAME', { playerName, ...(data as Record<string, unknown> | undefined) });
  }

  imageLoad(playerName: string, success: boolean, url?: string) {
    if (success) {
      this.debug(`Image loaded: ${playerName}`, 'IMAGE', { url });
    } else {
      this.warn(`Image failed: ${playerName}`, 'IMAGE', { url });
    }
  }

  timer(action: string, timeRemaining?: number) {
    this.debug(`Timer: ${action}`, 'TIMER', { timeRemaining });
  }
}

export const logger = new Logger();