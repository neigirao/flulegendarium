/**
 * Centralized logging utility for conditional debug logging and maintenance diagnostics.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: Date;
  correlationId: string;
}

const MAX_HISTORY = 150;

class Logger {
  private readonly isDevelopment =
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV) || process.env.NODE_ENV === 'development';

  private readonly correlationId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  private history: LogEntry[] = [];

  private log(level: LogLevel, message: string, context?: string, data?: unknown) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date(),
      correlationId: this.correlationId,
    };

    this.history.unshift(entry);
    if (this.history.length > MAX_HISTORY) {
      this.history.length = MAX_HISTORY;
    }

    const prefix = context ? `[${context}]` : '';
    const formattedMessage = `${prefix} ${message}`.trim();
    const metadata = {
      correlationId: entry.correlationId,
      timestamp: entry.timestamp.toISOString(),
      ...(data !== undefined ? { data } : {}),
    };

    switch (level) {
      case 'debug':
        console.log(`🔍 ${formattedMessage}`, metadata);
        break;
      case 'info':
        console.info(`ℹ️ ${formattedMessage}`, metadata);
        break;
      case 'warn':
        console.warn(`⚠️ ${formattedMessage}`, metadata);
        break;
      case 'error':
        console.error(`❌ ${formattedMessage}`, metadata);
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

  maintenance(event: string, data?: Record<string, unknown>) {
    this.info(`Maintenance: ${event}`, 'MAINTENANCE', data);
  }

  getRecentLogs(limit = 20): LogEntry[] {
    return this.history.slice(0, limit);
  }

  clearRecentLogs() {
    this.history = [];
  }

  // Game-specific logging methods
  gameAction(action: string, playerName?: string, data?: unknown) {
    this.debug(`Game: ${action}`, 'GAME', {
      playerName,
      ...(data as Record<string, unknown> | undefined),
    });
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
