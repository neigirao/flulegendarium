
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// eslint-disable-next-line react-refresh/only-export-components
const GameErrorFallback = ({ onRetry, onGoBack }: { onRetry: () => void; onGoBack: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/20 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
              className="w-12 h-12 object-contain opacity-50"
            />
          </div>
          <CardTitle className="text-primary flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Erro no Jogo
          </CardTitle>
          <CardDescription>
            Ocorreu um problema durante o jogo. Suas estatísticas foram salvas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={onRetry}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button 
              variant="outline" 
              onClick={onGoBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('GameErrorBoundary caught an error', 'ERROR_BOUNDARY', {
      error: error.message,
      componentStack: errorInfo.componentStack
    });
    
    // Track game errors for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'game_error', {
        error_message: error.message,
        component_stack: errorInfo.componentStack
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  handleGoBack = () => {
    window.location.href = '/selecionar-modo-jogo';
  };

  render() {
    if (this.state.hasError) {
      return (
        <GameErrorFallback 
          onRetry={this.handleRetry}
          onGoBack={this.handleGoBack}
        />
      );
    }

    return this.props.children;
  }
}
