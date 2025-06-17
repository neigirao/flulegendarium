
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { debugLogger } from '@/utils/debugLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo?: string;
  errorStack?: string;
  componentStack?: string;
}

export class SimpleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    debugLogger.error('ErrorBoundary', 'Erro capturado pelo boundary', error);
    
    return { 
      hasError: true,
      errorInfo: error.message || 'Erro desconhecido',
      errorStack: error.stack
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    debugLogger.error('ErrorBoundary', 'Detalhes completos do erro', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    
    this.setState({
      componentStack: errorInfo.componentStack
    });

    // Log detalhado para debug
    console.group('🚨 Error Boundary - Erro Capturado');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Debug logs:', debugLogger.getLogs().slice(0, 10));
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-2xl mx-auto">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Ops! Algo deu errado
            </h1>
            
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Detalhes técnicos:</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Erro:</strong> {this.state.errorInfo}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Timestamp:</strong> {new Date().toLocaleString()}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  debugLogger.info('ErrorBoundary', 'Usuário tentou recarregar');
                  window.location.reload();
                }}
                className="bg-flu-grena text-white px-6 py-3 rounded-lg hover:bg-flu-grena/90 transition-colors"
              >
                Recarregar Página
              </button>
              
              <button
                onClick={() => {
                  debugLogger.info('ErrorBoundary', 'Usuário abriu console de debug');
                  console.log('🎮 Estado atual da aplicação:', {
                    error: this.state,
                    logs: debugLogger.getLogs(),
                    timestamp: new Date().toISOString()
                  });
                  alert('Logs de debug foram exibidos no console (F12)');
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Ver Debug (Console)
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Se o problema persistir, entre em contato através do nosso Instagram @jogolendasdoflu
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
