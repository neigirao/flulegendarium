
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo?: string;
}

export class SimpleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('SimpleErrorBoundary - Error caught:', error);
    return { 
      hasError: true,
      errorInfo: error.message || 'Erro desconhecido'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SimpleErrorBoundary caught error:', error, errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Log detalhado para debug
    console.group('🚨 Error Boundary Details');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Ops! Algo deu errado
            </h1>
            <p className="text-gray-600 mb-2">
              Recarregue a página para tentar novamente.
            </p>
            {this.state.errorInfo && (
              <p className="text-sm text-gray-500 mb-6">
                Erro: {this.state.errorInfo}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-flu-grena text-white px-6 py-3 rounded-lg hover:bg-flu-grena/90 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
