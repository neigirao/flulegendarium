// Sistema de relatório de erros estruturado

export interface ErrorReport {
  id: string;
  timestamp: string;
  type: 'javascript' | 'network' | 'validation' | 'user_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent: string;
  url: string;
  userId?: string;
}

class ErrorReporter {
  private reports: ErrorReport[] = [];
  private maxReports = 50; // Keep only last 50 reports in memory

  generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  report(error: {
    type: ErrorReport['type'];
    severity: ErrorReport['severity'];
    message: string;
    stack?: string;
    context?: Record<string, any>;
  }): string {
    const report: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...error
    };

    // Add to memory
    this.reports.unshift(report);
    
    // Keep only latest reports
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(0, this.maxReports);
    }

    // Console log for development
    const logMethod = {
      low: console.info,
      medium: console.warn,
      high: console.error,
      critical: console.error
    }[error.severity];

    logMethod(`📊 Error Report [${report.id}]:`, {
      type: error.type,
      severity: error.severity,
      message: error.message,
      context: error.context,
      timestamp: report.timestamp
    });

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'error_report', {
        error_type: error.type,
        error_severity: error.severity,
        error_message: error.message,
        error_id: report.id
      });
    }

    return report.id;
  }

  getReports(): ErrorReport[] {
    return [...this.reports];
  }

  getReportById(id: string): ErrorReport | undefined {
    return this.reports.find(report => report.id === id);
  }

  clearReports(): void {
    this.reports = [];
    console.log('🧹 Error reports cleared');
  }

  // Convenience methods for different error types
  reportJavaScriptError(error: Error, context?: Record<string, any>): string {
    return this.report({
      type: 'javascript',
      severity: 'high',
      message: error.message,
      stack: error.stack,
      context
    });
  }

  reportNetworkError(message: string, context?: Record<string, any>): string {
    return this.report({
      type: 'network',
      severity: 'medium',
      message,
      context
    });
  }

  reportValidationError(message: string, context?: Record<string, any>): string {
    return this.report({
      type: 'validation',
      severity: 'low',
      message,
      context
    });
  }

  reportUserActionError(message: string, context?: Record<string, any>): string {
    return this.report({
      type: 'user_action',
      severity: 'medium',
      message,
      context
    });
  }
}

// Global instance
export const errorReporter = new ErrorReporter();

// Global error handlers
if (typeof window !== 'undefined') {
  // Catch unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    errorReporter.reportJavaScriptError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorReporter.report({
      type: 'javascript',
      severity: 'high',
      message: `Unhandled Promise Rejection: ${event.reason}`,
      context: {
        reason: String(event.reason),
        promise: event.promise
      }
    });
  });
}
