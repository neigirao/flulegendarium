
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class RootErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('🔥 RootErrorBoundary caught error:', error);
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('🚨 Root Error Boundary detailed error:', errorData);

    this.setState({
      error,
      errorInfo
    });

    // Simple analytics tracking without complex error reporting
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'app_crash', {
          error_message: error.message,
          error_id: this.state.errorId
        });
      }
    } catch (analyticsError) {
      console.warn('Analytics tracking failed:', analyticsError);
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Tentativa de recuperação ${this.retryCount}/${this.maxRetries}`);
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: this.generateErrorId()
      });
    } else {
      console.warn('⚠️ Máximo de tentativas de recuperação atingido');
      this.handleReload();
    }
  };

  handleReload = () => {
    console.log('🔄 Recarregando aplicação...');
    window.location.reload();
  };

  handleGoHome = () => {
    console.log('🏠 Redirecionando para página inicial...');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.retryCount < this.maxRetries;
      
      return (
        <div className="min-h-screen bg-gradient-to-b from-flu-verde/10 to-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-flu-grena flex items-center justify-center gap-2">
                <Bug className="w-5 h-5" />
                Ops! Algo deu errado
              </CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado na aplicação. Nossas equipes foram notificadas.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>ID do Erro:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Use este código ao reportar o problema
                </p>
              </div>

              <div className="flex gap-2">
                {canRetry ? (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1 bg-flu-grena hover:bg-flu-grena/90"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente ({this.maxRetries - this.retryCount})
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleReload}
                    className="flex-1 bg-flu-grena hover:bg-flu-grena/90"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recarregar App
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Início
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-red-50 rounded text-xs border border-red-200">
                  <summary className="cursor-pointer font-medium text-red-700 mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="space-y-2 text-red-600">
                    <div>
                      <strong>Erro:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-all">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-all text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
