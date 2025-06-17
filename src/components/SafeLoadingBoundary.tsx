
import React, { Component, ReactNode } from 'react';
import { debugLogger } from '@/utils/debugLogger';
import { Loader2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  name: string;
  timeout?: number;
}

interface State {
  isLoading: boolean;
  hasTimedOut: boolean;
  startTime: number;
}

export class SafeLoadingBoundary extends Component<Props, State> {
  private timeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      hasTimedOut: false,
      startTime: Date.now()
    };

    debugLogger.info('SafeLoadingBoundary', `Inicializado: ${props.name}`);
  }

  componentDidMount() {
    const timeout = this.props.timeout || 10000; // 10 segundos padrão
    
    this.timeoutId = setTimeout(() => {
      debugLogger.warn('SafeLoadingBoundary', `Timeout atingido: ${this.props.name}`, { 
        timeout,
        elapsedTime: Date.now() - this.state.startTime 
      });
      
      this.setState({ hasTimedOut: true });
    }, timeout);

    // Simular carregamento concluído após um tempo
    setTimeout(() => {
      this.setState({ isLoading: false });
      debugLogger.info('SafeLoadingBoundary', `Carregamento concluído: ${this.props.name}`);
    }, 100);
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  render() {
    if (this.state.hasTimedOut) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-flu-grena mb-4">
              Tempo Limite Excedido
            </h2>
            <p className="text-gray-600 mb-6">
              O componente {this.props.name} demorou muito para carregar.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-flu-grena text-white px-6 py-3 rounded-lg hover:bg-flu-grena/90"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    if (this.state.isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-flu-grena mx-auto mb-4" />
            <p className="text-flu-grena font-semibold">
              Carregando {this.props.name}...
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
