export interface LogContext {
  component?: string;
  action?: string;
  data?: any;
  userId?: string;
  decade?: string;
  [key: string]: any;
}

export class Logger {
  private static isDev = import.meta.env.DEV;
  
  static info(message: string, context?: LogContext) {
    if (this.isDev) {
      console.log(`ℹ️ ${message}`, context ? { context } : '');
    }
  }
  
  static error(message: string, error?: Error, context?: LogContext) {
    console.error(`❌ ${message}`, { error, context });
    
    // Em produção, enviar para serviço de monitoramento
    if (!this.isDev && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'error', {
        error_message: message,
        error_details: error?.message,
        error_stack: error?.stack,
        ...context
      });
    }
  }
  
  static warn(message: string, context?: LogContext) {
    if (this.isDev) {
      console.warn(`⚠️ ${message}`, context ? { context } : '');
    }
  }
  
  static debug(message: string, context?: LogContext) {
    if (this.isDev) {
      console.debug(`🐛 ${message}`, context ? { context } : '');
    }
  }
  
  static performance(label: string, startTime: number) {
    if (this.isDev) {
      const duration = performance.now() - startTime;
      console.log(`⏱️ Performance [${label}]: ${duration.toFixed(2)}ms`);
    }
  }
}

// Helper para timing de operações
export const measurePerformance = async <T>(
  label: string,
  operation: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await operation();
    Logger.performance(label, startTime);
    return result;
  } catch (error) {
    Logger.error(`Error in ${label}`, error as Error);
    throw error;
  }
};