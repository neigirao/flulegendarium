import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    logger.error(`Error boundary caught error (${level})`, 'ERROR_BOUNDARY', { 
      error: error.message,
      stack: error.stack,
      errorInfo: errorInfo.componentStack,
      level
    });

    if (onError) {
      onError(error, errorInfo);
    }

    // Track error in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'error_boundary_triggered', {
        error_message: error.message,
        error_level: level,
        component_stack: errorInfo.componentStack,
        error_id: this.state.errorId
      });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      logger.info(`Retrying after error (attempt ${this.state.retryCount + 1}/${this.maxRetries})`);
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback, level = 'component' } = this.props;
      const { error, retryCount, errorId } = this.state;

      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const canRetry = retryCount < this.maxRetries;
      const isCritical = level === 'critical';

      return (
        <Card className="max-w-2xl mx-auto my-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              {isCritical ? 'Erro Crítico' : 'Algo deu errado'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-600">
              {isCritical ? (
                <p>Ocorreu um erro crítico que impediu o carregamento da aplicação.</p>
              ) : (
                <p>Oops! Algo inesperado aconteceu. Você pode tentar novamente ou voltar à página inicial.</p>
              )}
            </div>

            {import.meta.env.DEV && error && (
              <details className="bg-gray-50 p-4 rounded border text-sm">
                <summary className="cursor-pointer font-medium">Detalhes do erro (modo desenvolvimento)</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-red-600">
                  {error.message}
                  {error.stack && '\n\n' + error.stack}
                </pre>
                {errorId && (
                  <p className="mt-2 text-gray-500">ID do erro: {errorId}</p>
                )}
              </details>
            )}

            <div className="flex gap-3 flex-wrap">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente ({this.maxRetries - retryCount} restantes)
                </Button>
              )}

              {!isCritical && (
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Ir para Início
                </Button>
              )}

              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Página
              </Button>
            </div>

            {!canRetry && (
              <div className="text-sm text-gray-500 p-3 bg-yellow-50 border border-yellow-200 rounded">
                Limite de tentativas excedido. Recarregue a página ou volte ao início.
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}