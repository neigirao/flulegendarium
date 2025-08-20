import React, { ReactNode } from 'react';
import { Player } from '@/types/guess-game';
import { ResponsiveContainer } from '@/components/ux/ResponsiveContainer';
import { LoadingState } from '@/components/ux/LoadingStates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface BaseGameContainerProps {
  // Navigation
  onBack?: () => void;
  backLabel?: string;
  
  // Header
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconColor?: string;
  
  // Game state
  isLoading: boolean;
  loadingMessage?: string;
  hasPlayers: boolean;
  emptyStateMessage?: string;
  emptyStateAction?: ReactNode;
  
  // Stats
  playerCount?: number;
  
  // Actions
  onReset?: () => void;
  showReset?: boolean;
  
  // Game content
  children: ReactNode;
  
  // Debug
  showDebug?: boolean;
  debugContent?: ReactNode;
}

export const BaseGameContainer: React.FC<BaseGameContainerProps> = ({
  onBack,
  backLabel = "Voltar",
  title,
  subtitle,
  icon,
  iconColor = "bg-flu-grena",
  isLoading,
  loadingMessage = "Carregando...",
  hasPlayers,
  emptyStateMessage = "Nenhum jogador encontrado",
  emptyStateAction,
  playerCount,
  onReset,
  showReset = true,
  children,
  showDebug = false,
  debugContent
}) => {
  return (
    <ResponsiveContainer variant="game" maxWidth="xl">
      {/* Header compacto e consistente */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            {icon && (
              <div className={`w-6 h-6 rounded-full ${iconColor} flex items-center justify-center text-white text-xs`}>
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-flu-grena">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {playerCount !== undefined && (
            <Badge variant="secondary" className="bg-flu-verde/10 text-flu-verde text-xs">
              {playerCount} jogadores
            </Badge>
          )}
          
          {onReset && showReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo do jogo */}
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingState type="general" message={loadingMessage} />
          </div>
        ) : !hasPlayers ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold text-flu-grena mb-2">
              {emptyStateMessage}
            </h3>
            {emptyStateAction}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Debug section - apenas em desenvolvimento */}
      {showDebug && process.env.NODE_ENV === 'development' && debugContent && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h3>
          {debugContent}
        </div>
      )}
    </ResponsiveContainer>
  );
};