
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  log(level: LogEntry['level'], component: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output com cores
    const colors = {
      info: '\x1b[36m',
      warn: '\x1b[33m', 
      error: '\x1b[31m',
      debug: '\x1b[90m'
    };
    
    console.log(
      `${colors[level]}[${level.toUpperCase()}] ${component}: ${message}\x1b[0m`,
      data ? data : ''
    );
  }

  info(component: string, message: string, data?: any) {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: any) {
    this.log('warn', component, message, data);
  }

  error(component: string, message: string, data?: any) {
    this.log('error', component, message, data);
  }

  debug(component: string, message: string, data?: any) {
    this.log('debug', component, message, data);
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    console.log('🧹 Debug logs cleared');
  }
}

export const debugLogger = new DebugLogger();

// Adicionar ao window para debug global
if (typeof window !== 'undefined') {
  (window as any).debugLogger = debugLogger;
}
